/** Registro dos projetos que alimentam este painel. */

export type SlugProjeto = "matriculas" | "educacao-dos-sonhos";

export interface Projeto {
  slug: SlugProjeto;
  nome: string;
  dominio: string;
  /** true quando o projeto vive fora deste sistema e entrega por API. */
  externo: boolean;
}

/**
 * Os projetos que mandam lead para este painel.
 *
 * O site de matrículas é este próprio sistema. O Educação dos Sonhos é um
 * projeto separado, com identidade visual própria, repositório próprio e
 * domínio próprio — ele só conversa com este sistema por uma coisa: o
 * lead. A entrega acontece servidor-a-servidor, autenticada por token,
 * em /api/leads/externo.
 *
 * O que importa aqui é distinguir a origem: sem isso os leads dos dois
 * apareceriam misturados na mesma tela do painel.
 */
export const PROJETOS: Projeto[] = [
  {
    slug: "matriculas",
    nome: "Matrículas 2027",
    dominio:
      process.env.NEXT_PUBLIC_DOMINIO_MATRICULAS ??
      "educaadventistacentrooeste.com.br",
    externo: false,
  },
  {
    slug: "educacao-dos-sonhos",
    nome: "Educação dos Sonhos",
    dominio: process.env.DOMINIO_SONHOS ?? "educacaodossonhos.com.br",
    externo: true,
  },
];

export const PROJETO_PADRAO = PROJETOS[0];

export function getProjeto(slug: string): Projeto | undefined {
  return PROJETOS.find((p) => p.slug === slug);
}

export function ehSlugDeProjeto(v: unknown): v is SlugProjeto {
  return typeof v === "string" && PROJETOS.some((p) => p.slug === v);
}
