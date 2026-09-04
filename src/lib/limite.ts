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
 */

interface Balde {
  fichas: number;
  ultimo: number;
}

const POR_IP = new Map<string, Balde>();
/** Envios por IP em uma janela. Família de verdade manda um; dez em um
 *  minuto do mesmo endereço é script ou alguém testando. */
const FICHAS = 8;
const JANELA_MS = 60_000;

/** Telefone → quando foi visto. Mesmo telefone em poucos minutos é a
 *  mesma família apertando de novo, não outra família. */
const TELEFONES = new Map<string, number>();
const DEDUP_MS = 10 * 60_000;

function limpar(agora: number) {
  // Coleta preguiçosa: sem timer, sem fio solto no processo.
  for (const [ip, b] of POR_IP) {
    if (agora - b.ultimo > JANELA_MS * 2) POR_IP.delete(ip);
  }
  for (const [tel, t] of TELEFONES) {
    if (agora - t > DEDUP_MS) TELEFONES.delete(tel);
  }
}

/** Verdadeiro se este IP ainda pode enviar agora. */
export function permitido(ip: string, agora = Date.now()): boolean {
  if (POR_IP.size > 5000) limpar(agora);
  const chave = ip || "sem-ip";
  const b = POR_IP.get(chave) ?? { fichas: FICHAS, ultimo: agora };
  // Reposição proporcional ao tempo que passou.
  const repostas = ((agora - b.ultimo) / JANELA_MS) * FICHAS;
  b.fichas = Math.min(FICHAS, b.fichas + repostas);
  b.ultimo = agora;
  if (b.fichas < 1) {
    POR_IP.set(chave, b);
    return false;
  }
  b.fichas -= 1;
  POR_IP.set(chave, b);
  return true;
}

/**
 * Verdadeiro se este telefone acabou de ser enviado. Registra a passagem
 * quando não estava: a primeira chamada passa, a segunda em dez minutos
 * não.
 */
export function repetido(telefone: string, agora = Date.now()): boolean {
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return false;
  if (TELEFONES.size > 5000) limpar(agora);
  const visto = TELEFONES.get(digitos);
  if (visto !== undefined && agora - visto < DEDUP_MS) return true;
  TELEFONES.set(digitos, agora);
  return false;
}

/** Só para os testes: zera o estado entre casos. */
export function _zerar() {
  POR_IP.clear();
  TELEFONES.clear();
}
