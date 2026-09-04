/**
 * Relatório mensal de captação.
 *
 * A pergunta que ele responde não é "quantos leads entraram" — esse
 * número sozinho não muda decisão nenhuma. É:
 *
 *   · qual escola está puxando a demanda, e qual não aparece
 *   · qual série falta preencher
 *   · qual campanha trouxe gente que virou atendimento, e não só clique
 *   · o que subiu e o que caiu em relação ao mês passado
 *
 * O mês anterior anda junto de propósito. Número sem comparação vira
 * enfeite: 78 leads é bom ou ruim? Depende de terem sido 40 ou 130 antes.
 *
 * As contas de data e de variação ficam aqui como funções puras, sem
 * banco, para poderem ser testadas — o resto do arquivo é agregação em
 * SQL, e o banco filtra por região antes de somar qualquer coisa.
 */

import { getPool } from "@/lib/db";

export interface FaixaMes {
  /** Primeiro instante do mês, hora local do Brasil. */
  inicio: Date;
  /** Primeiro instante do mês seguinte: o corte é `< fim`. */
  fim: Date;
  rotulo: string;
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/**
 * Limites de um mês. `mes` é 1–12, como as pessoas contam, e não 0–11
 * como o JavaScript — a conversão fica aqui, num lugar só, porque essa é
 * a troca que produz relatório do mês errado.
 */
export function faixaDoMes(ano: number, mes: number): FaixaMes {
  const inicio = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
  const fim = new Date(ano, mes, 1, 0, 0, 0, 0);
  return { inicio, fim, rotulo: `${MESES[mes - 1]} de ${ano}` };
}

/** O mês imediatamente anterior, virando o ano quando precisa. */
export function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
}

/**
 * Variação percentual, arredondada. Devolve null quando não havia base:
  * sair de zero para dez não é "crescimento de 1000%", é começar — e
 * mostrar um percentual aí engana quem lê.
 */
export function variacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return Math.round(((atual - anterior) / anterior) * 100);
}

/**
 * Primeiro dia útil do mês, para a tarefa agendada. Sábado e domingo
 * empurram para segunda. Feriado não entra: a lista muda por estado e
 * por ano, e relatório que chega num feriado nacional continua sendo
 * lido no dia seguinte — errar para mais cedo é barato.
 */
export function primeiroDiaUtil(ano: number, mes: number): Date {
  const d = new Date(ano, mes - 1, 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Nome legível da campanha. O que interessa a quem lê é de onde a pessoa
 * veio, e `utm_source` sozinho ("fb") não diz nada sem a campanha junto.
 */
export function rotuloCampanha(utm: Record<string, string> | null | undefined): string {
  if (!utm) return "Sem campanha (acesso direto)";
  const fonte = utm.utm_source?.trim();
  const nome = utm.utm_campaign?.trim();
  if (fonte && nome) return `${fonte} · ${nome}`;
  if (nome) return nome;
  if (fonte) return fonte;
  if (utm.gclid) return "Google Ads";
  if (utm.fbclid) return "Meta Ads";
  return "Sem campanha (acesso direto)";
}

/** Um lead como ele aparece no relatório: o suficiente para a
 *  coordenação reconhecer a família, sem repetir a tela de leads. */
export interface LeadDoRelatorio {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  escola: string;
  nivel: string;
  criado_em: string;
  atendimento_status: string;
}

export interface GrupoRegiao {
  regiao: string;
  total: number;
  atendidos: number;
  leads: LeadDoRelatorio[];
}

export interface Linha {
  rotulo: string;
  total: number;
  atendidos: number;
}

export interface Relatorio {
  rotulo: string;
  inicio: string;
  fim: string;
  total: number;
  totalAnterior: number;
  variacao: number | null;
  atendidos: number;
  aguardando: number;
  comEmail: number;
  /** Quantos chegaram em cada dia do mês. É o que mostra o ritmo: 78
   *  leads espalhados no mês e 78 concentrados num anúncio de dois dias
   *  são situações diferentes, e o total sozinho não distingue. */
  porDia: { dia: number; total: number }[];
  porRegiao: Linha[];
  /** Todos os leads do mês, separados por região — é o corpo do
   *  relatório, e o resto é resumo dele. Cada coordenação lê o próprio
   *  bloco e reconhece as famílias pelo nome. */
  leadsPorRegiao: GrupoRegiao[];
  porEscola: Linha[];
  porNivel: Linha[];
  porCampanha: Linha[];
}

/** Ordena do maior para o menor e corta a cauda, que ninguém lê. */
function ranquear(linhas: Linha[], limite = 12): Linha[] {
  return [...linhas].sort((a, b) => b.total - a.total).slice(0, limite);
}

export async function gerarRelatorio(opcoes: {
  ano: number;
  mes: number;
  regioesPermitidas?: string[] | null;
  /** Traduz o slug interno para o nome que a coordenação usa. */
  nomeRegiao?: (slug: string) => string;
}): Promise<Relatorio | null> {
  const db = getPool();
  if (!db) return null;

  const faixa = faixaDoMes(opcoes.ano, opcoes.mes);
  const antes = mesAnterior(opcoes.ano, opcoes.mes);
  const faixaAntes = faixaDoMes(antes.ano, antes.mes);

  // Coordenador só soma o que ele pode ver. O recorte entra na consulta,
  // e não depois: número agregado de região alheia continua sendo
  // informação de região alheia.
  const permitidas = opcoes.regioesPermitidas;
  if (permitidas && permitidas.length === 0) return null;
  const filtroRegiao = permitidas ? `AND estado = ANY($3)` : "";
  const valores: unknown[] = [faixa.inicio, faixa.fim];
  if (permitidas) valores.push(permitidas);

  const { rows } = await db.query(
    `SELECT id, nome, whatsapp, estado, escola, nivel, utm, criado_em,
            atendimento_status, email
       FROM leads
      WHERE criado_em >= $1 AND criado_em < $2 ${filtroRegiao}
      ORDER BY criado_em ASC`,
    valores,
  );

  const valoresAntes: unknown[] = [faixaAntes.inicio, faixaAntes.fim];
  if (permitidas) valoresAntes.push(permitidas);
  const { rows: linhasAntes } = await db.query(
    `SELECT count(*)::int AS n FROM leads
      WHERE criado_em >= $1 AND criado_em < $2 ${filtroRegiao}`,
    valoresAntes,
  );
  const totalAnterior = linhasAntes[0]?.n ?? 0;

  const acumular = new Map<string, Map<string, Linha>>([
    ["regiao", new Map()],
    ["escola", new Map()],
    ["nivel", new Map()],
    ["campanha", new Map()],
  ]);

  const somar = (grupo: string, rotulo: string, atendido: boolean) => {
    const mapa = acumular.get(grupo)!;
    const linha = mapa.get(rotulo) ?? { rotulo, total: 0, atendidos: 0 };
    linha.total += 1;
    if (atendido) linha.atendidos += 1;
    mapa.set(rotulo, linha);
  };

  const diasNoMes = new Date(opcoes.ano, opcoes.mes, 0).getDate();
  const porDia = Array.from({ length: diasNoMes }, (_, i) => ({
    dia: i + 1,
    total: 0,
  }));

  const porRegiaoDetalhe = new Map<string, GrupoRegiao>();

  let atendidos = 0;
  let comEmail = 0;
  for (const r of rows) {
    const dia = new Date(r.criado_em).getDate();
    if (porDia[dia - 1]) porDia[dia - 1].total += 1;
    const atendido = r.atendimento_status === "atendido";
    if (atendido) atendidos += 1;
    if (r.email) comEmail += 1;
    somar("regiao", opcoes.nomeRegiao?.(r.estado) ?? r.estado, atendido);
    somar("escola", r.escola || "Não informou a escola", atendido);
    somar("nivel", r.nivel || "Não informou a série", atendido);
    somar("campanha", rotuloCampanha(r.utm), atendido);

    const regiao = opcoes.nomeRegiao?.(r.estado) ?? r.estado;
    const grupo =
      porRegiaoDetalhe.get(regiao) ??
      { regiao, total: 0, atendidos: 0, leads: [] as LeadDoRelatorio[] };
    grupo.total += 1;
    if (atendido) grupo.atendidos += 1;
    grupo.leads.push({
      id: String(r.id),
      nome: r.nome,
      whatsapp: r.whatsapp,
      email: r.email ?? "",
      escola: r.escola ?? "",
      nivel: r.nivel ?? "",
      criado_em: new Date(r.criado_em).toISOString(),
      atendimento_status: r.atendimento_status,
    });
    porRegiaoDetalhe.set(regiao, grupo);
  }

  return {
    rotulo: faixa.rotulo,
    inicio: faixa.inicio.toISOString(),
    fim: faixa.fim.toISOString(),
    total: rows.length,
    totalAnterior,
    variacao: variacao(rows.length, totalAnterior),
    atendidos,
    aguardando: rows.length - atendidos,
    comEmail,
    porDia,
    porRegiao: ranquear([...acumular.get("regiao")!.values()], 20),
    leadsPorRegiao: [...porRegiaoDetalhe.values()].sort(
      (a, b) => b.total - a.total,
    ),
    porEscola: ranquear([...acumular.get("escola")!.values()]),
    porNivel: ranquear([...acumular.get("nivel")!.values()], 8),
    porCampanha: ranquear([...acumular.get("campanha")!.values()]),
  };
}

/** Meses que têm lead, do mais recente para o mais antigo. */
export async function mesesComDados(
  regioesPermitidas?: string[] | null,
): Promise<{ ano: number; mes: number; rotulo: string }[]> {
  const db = getPool();
  if (!db) return [];
  if (regioesPermitidas && regioesPermitidas.length === 0) return [];
  const filtro = regioesPermitidas ? `WHERE estado = ANY($1)` : "";
  const { rows } = await db.query(
    `SELECT DISTINCT
            extract(year  FROM criado_em)::int AS ano,
            extract(month FROM criado_em)::int AS mes
       FROM leads ${filtro}
      ORDER BY ano DESC, mes DESC
      LIMIT 24`,
    regioesPermitidas ? [regioesPermitidas] : [],
  );
  return rows.map((r) => ({
    ano: r.ano,
    mes: r.mes,
    rotulo: faixaDoMes(r.ano, r.mes).rotulo,
  }));
}
