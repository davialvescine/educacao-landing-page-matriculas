import dados from "@/data/rede.json";
import { linkWhatsapp, slugificar } from "@/lib/site";

export interface Escola {
  nome: string;
  nome_oficial?: string;
  endereco: string | null;
  foto: string | null;
  foto_propria?: boolean;
  foto_reaproveitada_de?: string | null;
  telefone?: string;
  whatsapp_escola?: string;
  site?: string;
  obs?: string;
  /** Associação interna dona da unidade; só preenchido em região agrupada. */
  associacao_slug?: string;
  pendencias?: string[];
}

export interface Estado {
  slug: string;
  nome: string;
  uf: string;
  associacao: string;
  whatsapp: {
    numero: string | null;
    link: string | null;
    confirmar_numero: boolean;
  };
  sem_pagina_no_site?: boolean;
  total_escolas: number;
  escolas: Escola[];
}

export interface Rede {
  slogan: string;
  titulo_campanha: string;
  estatisticas: { valor: string; rotulo: string }[];
  diferenciais: string[];
  estados: Estado[];
  iabc: {
    nome: string;
    tipo: string;
    site: string;
    endereco?: string;
    telefone?: string;
  };
}

const rede = dados as unknown as Rede;

export function getRede(): Rede {
  return rede;
}

export function getEstados(): Estado[] {
  return rede.estados;
}

export function getEstado(slug: string): Estado | undefined {
  return rede.estados.find((e) => e.slug === slug);
}

export function nomeEscola(escola: Escola): string {
  return escola.nome_oficial ?? escola.nome;
}

/** Pseudo-região do IABC: o internato também capta leads pelo formulário. */
export const IABC_SLUG = "iabc";

const REGIAO_IABC: Estado = {
  slug: IABC_SLUG,
  nome: "IABC (Internato)",
  uf: "GO",
  associacao: "UCOB",
  whatsapp: {
    numero: "(62) 3395-8000",
    link: "https://wa.me/556233958000",
    confirmar_numero: true,
  },
  total_escolas: 1,
  escolas: [
    {
      nome: "IABC, Instituto Adventista Brasil Central",
      endereco:
        "Rodovia BR 414, km 411, Planalmira, Abadiânia (GO), CEP 72940-000",
      foto: null,
    },
  ],
};

/** Região válida para leads: os 6 estados + o internato IABC. */
export function getRegiaoLead(slug: string): Estado | undefined {
  if (slug === IABC_SLUG) return REGIAO_IABC;
  return getEstado(slug);
}

/** Nome legível de uma região a partir do slug (fallback: o próprio slug). */
export function nomeRegiao(slug: string): string {
  return getRegiaoLead(slug)?.nome ?? slug;
}

/** Slug de URL de uma escola (a partir do nome oficial). */
export function slugEscola(escola: Escola): string {
  return slugificar(nomeEscola(escola));
}

/** Localiza uma escola pelo slug dentro de um estado. */
export function getEscola(
  estadoSlug: string,
  escolaSlug: string,
): { estado: Estado; escola: Escola } | undefined {
  // Pelas regiões do site: as URLs de escola do MT vivem em /mato-grosso.
  const estado = getRegiaoSite(estadoSlug) ?? getEstado(estadoSlug);
  if (!estado) return undefined;
  const escola = estado.escolas.find((s) => slugEscola(s) === escolaSlug);
  return escola ? { estado, escola } : undefined;
}

/** Cidade aproximada a partir do nome oficial ("Colégio Adventista de X" → "X"). */
export function cidadeEscola(escola: Escola): string {
  return nomeEscola(escola)
    .replace(/^(Colégio|Escola|Instituto) Adventista (de |do |da |dos |em )?/i, "")
    .trim();
}

/** "Cidade – UF", "Cidade-UF" ou "Cidade UF" no fim do logradouro. */
const CIDADE_COM_UF =
  /([A-ZÁÂÃÀÉÊÍÓÔÕÚÇ][^,–\-]*?)\s*[–\-\s]\s*(?:DF|GO|MS|MT|TO)\b/;

/**
 * Cidade real da unidade, lida do endereço.
 * O nome da escola não serve: várias são batizadas pelo bairro
 * ("Colégio Adventista Setor Pedro Ludovico" fica em Goiânia), e
 * cidadeEscola() devolveria o bairro. Sem endereço utilizável, null.
 */
export function cidadeDaUnidade(escola: Escola): string | null {
  const endereco = escola.endereco;
  if (!endereco) return null;

  const comUf = endereco.match(CIDADE_COM_UF);
  if (comUf) return comUf[1].trim();

  // Endereços sem UF: a cidade é o trecho logo antes do CEP.
  const partes = endereco.split(",").map((p) => p.trim());
  const iCep = partes.findIndex((p) => /^CEP\b/i.test(p));
  if (iCep > 0) return partes[iCep - 1] || null;

  return null;
}

/** Dados enxutos para o formulário de leads (client component). */
export function getFormEstados() {
  return [
    ...getRegioesSite().map((e) => ({
      slug: e.slug,
      nome: e.nome,
      uf: e.uf,
      escolas: e.escolas.map((s) => nomeEscola(s)),
    })),
    {
      slug: REGIAO_IABC.slug,
      nome: REGIAO_IABC.nome,
      uf: REGIAO_IABC.uf,
      escolas: REGIAO_IABC.escolas.map((s) => nomeEscola(s)),
    },
  ];
}

export type FormEstado = ReturnType<typeof getFormEstados>[number];

/* ------------------------------------------------------------------ *
 *  Regiões do site × associações internas
 *
 *  A família vê uma página só de Mato Grosso. A divisão entre ALM
 *  (Leste) e AOM (Oeste) é administrativa: continua valendo no painel,
 *  no recorte por região do coordenador e no lead gravado no banco.
 *  Quem faz a ponte é resolverRegiaoInterna(), pela escola escolhida.
 * ------------------------------------------------------------------ */

/** slug interno -> região agrupada que aparece no site. */
const GRUPOS: Record<string, { slug: string; nome: string; uf: string }> = {
  "leste-mt": { slug: "mato-grosso", nome: "Mato Grosso", uf: "MT" },
  "oeste-mt": { slug: "mato-grosso", nome: "Mato Grosso", uf: "MT" },
};

/**
 * As regiões como o site as apresenta: as agrupadas viram uma só.
 * Cada escola sai com o WhatsApp da própria associação preenchido, para
 * o card e a página da unidade continuarem falando com quem atende.
 */
function montarRegioesSite(
  sobrescritos: Record<string, { numero: string; link: string }> = {},
): Estado[] {
  const saida: Estado[] = [];
  const porGrupo = new Map<string, Estado>();

  for (const bruto of rede.estados) {
    const override = sobrescritos[bruto.slug];
    const estado: Estado = override
      ? {
          ...bruto,
          whatsapp: {
            numero: override.numero,
            link: override.link,
            confirmar_numero: false,
          },
        }
      : bruto;
    const grupo = GRUPOS[estado.slug];
    // O whatsapp_escola da base vem escrito para humano; sem normalizar,
    // o href sai como "(65) 99360-3279" e o clique não vai a lugar nenhum.
    const escolas = estado.escolas.map((escola) => ({
      ...escola,
      whatsapp_escola: linkWhatsapp(escola.whatsapp_escola) ?? undefined,
      ...(grupo
        ? {
            associacao_slug: estado.slug,
            whatsapp_escola:
              linkWhatsapp(escola.whatsapp_escola) ??
              estado.whatsapp.link ??
              undefined,
          }
        : {}),
    }));

    if (!grupo) {
      saida.push(estado);
      continue;
    }

    const existente = porGrupo.get(grupo.slug);
    if (existente) {
      existente.escolas.push(...escolas);
      existente.total_escolas = existente.escolas.length;
      // A primeira associação do grupo que tiver número fica com a página.
      if (!existente.whatsapp.link && estado.whatsapp.link) {
        existente.whatsapp = estado.whatsapp;
      }
      continue;
    }

    const agrupada: Estado = {
      ...grupo,
      associacao: "Educação Adventista",
      whatsapp: estado.whatsapp,
      total_escolas: escolas.length,
      escolas,
    };
    porGrupo.set(grupo.slug, agrupada);
    saida.push(agrupada);
  }

  return saida;
}

const REGIOES_SITE = montarRegioesSite();

/**
 * As regiões que a família vê: 5 páginas, com o Mato Grosso unificado.
 * Usa os números do rede.json — serve para rotas e listas, onde o telefone
 * não importa. Para renderizar telefone, use construirRegioesSite().
 */
export function getRegioesSite(): Estado[] {
  return REGIOES_SITE;
}

/** As mesmas regiões, com os números que a coordenação salvou no painel. */
export function construirRegioesSite(
  sobrescritos: Record<string, { numero: string; link: string }>,
): Estado[] {
  return Object.keys(sobrescritos).length
    ? montarRegioesSite(sobrescritos)
    : REGIOES_SITE;
}

export function getRegiaoSite(slug: string): Estado | undefined {
  return REGIOES_SITE.find((e) => e.slug === slug);
}

/**
 * Associação interna dona de uma escola, dentro de uma região do site.
 * Em região não agrupada devolve a própria; no Mato Grosso, descobre pela
 * escola se o lead é da ALM ou da AOM.
 */
export function resolverRegiaoInterna(
  slugSite: string,
  nomeDaEscola: string,
): Estado | undefined {
  const direta = getRegiaoLead(slugSite);
  if (direta) return direta;

  // Casa pelo nome oficial (o que o formulário manda) e também pelo nome
  // curto da base: uma edição no rede.json não pode derrubar o roteamento.
  const alvo = slugificar(nomeDaEscola);
  return rede.estados.find(
    (e) =>
      GRUPOS[e.slug]?.slug === slugSite &&
      e.escolas.some(
        (s) => slugEscola(s) === alvo || slugificar(s.nome) === alvo,
      ),
  );
}

/**
 * WhatsApp que atende uma unidade.
 * Numa região agrupada a escola carrega o número da própria associação: se
 * não tem, é porque a associação ainda não informou o dela, e herdar o
 * número da associação vizinha mandaria a família para quem não atende.
 */
export function whatsappDaEscola(
  escola: Escola,
  regiao: Estado,
): string | null {
  if (escola.whatsapp_escola) return escola.whatsapp_escola;
  if (escola.associacao_slug) return null;
  return regiao.whatsapp.link;
}

/**
 * Nome da região do jeito que a família conhece.
 * "Leste Mato-Grossense" é recorte administrativo: quem preencheu o
 * formulário escolheu "Mato Grosso" e nunca ouviu falar da divisão. O
 * painel e a exportação continuam com o nome interno, via nomeRegiao().
 */
export function nomeRegiaoParaFamilia(slug: string): string {
  return GRUPOS[slug]?.nome ?? nomeRegiao(slug);
}

/** Região de uma família a partir do slug do site ou do slug interno. */
export function getRegiaoPublica(slug: string): Estado | undefined {
  return getRegiaoSite(slug) ?? getRegiaoLead(slug);
}
