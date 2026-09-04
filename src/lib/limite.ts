/**
 * Trava de requisições e deduplicação do formulário público.
 *
 * `/api/leads` é rota aberta: qualquer um chama, sem login. Sem trava,
 * um script enche o banco e o CRM em minutos. Sem deduplicação, clique
 * duplo ou reenvio do Educação dos Sonhos vira duas famílias iguais no
 * Sevenbee, e a coordenação manda dois "olá".
 *
 * Sem `server-only` de propósito: o módulo é lógica pura com estado em
 * memória, e a marca impediria o teste de importá-lo. Nada aqui é
 * segredo; o que não pode vazar é o que chama isto, e aquilo é rota.
 *
 * Tudo em memória, de propósito. Um processo só, no Coolify; se virar
 * duas réplicas, isto passa a valer por réplica — o que ainda é uma trava,
 * só mais folgada — e aí é hora de mover para o Postgres.
 *
 * O que a trava por IP VALE depende do proxy da frente sobrescrever
 * x-forwarded-for (ver requisicao.ts). Sem isso, quem alcança a origem
 * inventa um IP por requisição. Por isso os mapas têm TETO: mesmo com
 * chave nova a cada chamada, a memória não cresce sem parar.
 */

interface Balde {
  fichas: number;
  ultimo: number;
}

const POR_IP = new Map<string, Balde>();
/** Balde de fichas: 8 de capacidade, repostas ao ritmo de 8 por minuto.
 *  Na prática cabem até ~15 envios no primeiro minuto de um IP novo, e
 *  depois 8 por minuto — folga suficiente para uma família e uma barreira
 *  para script. */
const FICHAS = 8;
const JANELA_MS = 60_000;

/**
 * Envio → quando foi visto. A chave é o pedido inteiro (telefone, nome,
 * série), e não só o telefone: um pai cadastrando dois filhos com o
 * mesmo número é dois pedidos legítimos, e clique duplo é o MESMO pedido
 * duas vezes. A janela é curta pelo mesmo motivo — cobre o clique duplo
 * e o "não sei se foi", não a tarde inteira.
 */
const ENVIOS = new Map<string, number>();
const DEDUP_MS = 2 * 60_000;

/** Teto dos mapas. Acima disto, as entradas mais antigas caem — Map
 *  preserva a ordem de inserção, então as primeiras são as mais velhas. */
const TETO = 10_000;

function podar<T>(mapa: Map<string, T>, viva: (v: T) => boolean) {
  for (const [k, v] of mapa) if (!viva(v)) mapa.delete(k);
  if (mapa.size > TETO) {
    let sobra = mapa.size - TETO;
    for (const k of mapa.keys()) {
      if (sobra-- <= 0) break;
      mapa.delete(k);
    }
  }
}

let chamadas = 0;
function manutencao(agora: number) {
  // A cada tantas chamadas, e não em toda: varrer o mapa inteiro por
  // requisição viraria custo proporcional ao ataque.
  if (++chamadas % 500 !== 0) return;
  podar(POR_IP, (b) => agora - b.ultimo <= JANELA_MS * 2);
  podar(ENVIOS, (t) => agora - t <= DEDUP_MS);
}

/** Verdadeiro se este IP ainda pode enviar agora. */
export function permitido(ip: string, agora = Date.now()): boolean {
  manutencao(agora);
  const chave = ip || "sem-ip";
  const b = POR_IP.get(chave) ?? { fichas: FICHAS, ultimo: agora };
  const repostas = ((agora - b.ultimo) / JANELA_MS) * FICHAS;
  b.fichas = Math.min(FICHAS, b.fichas + repostas);
  b.ultimo = agora;
  // Reinsere no fim para a ordem do mapa refletir uso recente.
  POR_IP.delete(chave);
  POR_IP.set(chave, b);
  if (POR_IP.size > TETO) podar(POR_IP, () => true);
  if (b.fichas < 1) return false;
  b.fichas -= 1;
  return true;
}

/** Chave de deduplicação: telefone só dígitos (sem o 55), nome e série
 *  normalizados. Exportada para o teste conferir a normalização. */
export function chaveDoPedido(p: {
  whatsapp: string;
  nome: string;
  nivel: string;
  escola: string;
}): string {
  let tel = p.whatsapp.replace(/\D/g, "");
  if (tel.startsWith("55") && tel.length >= 12) tel = tel.slice(2);
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  // A escola entra na chave: mesmo filho pedido para duas escolas em
  // dois minutos é a família comparando, e são dois pedidos legítimos.
  return `${tel}|${norm(p.nome)}|${norm(p.nivel)}|${norm(p.escola)}`;
}

/** Verdadeiro se este mesmo pedido acabou de ser GRAVADO. Só consulta. */
export function repetido(chave: string, agora = Date.now()): boolean {
  if (!chave.split("|")[0]) return false;
  const visto = ENVIOS.get(chave);
  return visto !== undefined && agora - visto < DEDUP_MS;
}

/**
 * Marca o pedido como gravado. Chamar DEPOIS de salvar, nunca antes: a
 * primeira versão marcava antes de validar, e quem recebia 400, corrigia
 * e reenviava ganhava um "sucesso" falso — o lead sumia.
 */
export function lembrar(chave: string, agora = Date.now()) {
  if (!chave.split("|")[0]) return;
  // Tira e põe de novo: renovar no lugar deixaria a chave na posição
  // antiga do Map, e a poda por teto a tomaria por velha.
  ENVIOS.delete(chave);
  ENVIOS.set(chave, agora);
  if (ENVIOS.size > TETO) podar(ENVIOS, (t) => agora - t <= DEDUP_MS);
}

/** Só para os testes: zera o estado entre casos. */
export function _zerar() {
  POR_IP.clear();
  ENVIOS.clear();
  chamadas = 0;
}
