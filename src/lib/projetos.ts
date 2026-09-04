/**
 * Os dois projetos servidos por esta aplicação.
 *
 * Domínio separado, mesma base de código: o lead dos dois cai no mesmo
 * painel, e a integração com o CRM, a fila de resiliência e a gravação
 * antes do envio são as mesmas — não há duas cópias para divergir.
 *
 * O que precisa ficar separado é o que o buscador enxerga: cada domínio
 * tem endereço canônico, sitemap e robots próprios. Servir o mesmo
 * conteúdo nos dois hosts seria conteúdo duplicado, e um deles perderia
 * posição.
 */

export type SlugProjeto = "matriculas" | "educacao-dos-sonhos";

export interface Projeto {
  slug: SlugProjeto;
  nome: string;
  dominio: string;
  /** Prefixo das rotas deste projeto dentro do app. "" = raiz. */
  base: string;
  /** Só o projeto principal expõe o painel administrativo. */
  temPainel: boolean;
}

export const PROJETOS: Projeto[] = [
  {
    slug: "matriculas",
    nome: "Matrículas 2027",
    dominio: process.env.NEXT_PUBLIC_DOMINIO_MATRICULAS ?? "educaadventistacentrooeste.com.br",
    base: "",
    temPainel: true,
  },
  {
    slug: "educacao-dos-sonhos",
    nome: "Educação dos Sonhos",
    dominio: process.env.NEXT_PUBLIC_DOMINIO_SONHOS ?? "educacaodossonhos.com.br",
    base: "/sonhos",
    temPainel: false,
  },
];

export const PROJETO_PADRAO = PROJETOS[0];

/** Hostname sem porta e sem "www.". */
export function normalizarHost(host: string | null | undefined): string {
  return (host ?? "").toLowerCase().split(":")[0].replace(/^www\./, "");
}

/**
 * Hosts extras autorizados além dos domínios dos projetos: preview do
 * Coolify, staging, health check interno. Lista separada por vírgula.
 */
const HOSTS_EXTRA = (process.env.HOSTS_AUTORIZADOS ?? "")
  .split(",")
  .map((h) => normalizarHost(h))
  .filter(Boolean);

/** Em desenvolvimento qualquer host serve; em produção, não. */
const EM_PRODUCAO = process.env.NODE_ENV === "production";

/**
 * Projeto dono de um hostname, ou null se o host não for autorizado.
 *
 * Devolver o site principal para host desconhecido seria abrir a porta:
 * qualquer domínio apontado para o IP da origem passaria a servir o site
 * inteiro num endereço não autorizado — o que o buscador lê como conteúdo
 * duplicado — e os leads entrariam classificados como se fossem dele.
 */
export function projetoPorHost(host: string | null | undefined): Projeto | null {
  const limpo = normalizarHost(host);
  const conhecido = PROJETOS.find((p) => p.dominio === limpo);
  if (conhecido) return conhecido;
  if (HOSTS_EXTRA.includes(limpo)) return PROJETO_PADRAO;
  // Fora de produção vale tudo: localhost, IP, túnel de teste.
  if (!EM_PRODUCAO) return PROJETO_PADRAO;
  return null;
}

/** Como acima, mas nunca nulo — para quem precisa seguir mesmo assim. */
export function projetoPorHostOuPadrao(host: string | null | undefined): Projeto {
  return projetoPorHost(host) ?? PROJETO_PADRAO;
}

/** Projeto dono de uma rota interna. */
export function projetoPorRota(caminho: string): Projeto {
  const comBase = PROJETOS.find(
    (p) => p.base && (caminho === p.base || caminho.startsWith(`${p.base}/`)),
  );
  return comBase ?? PROJETO_PADRAO;
}

export function urlDoProjeto(projeto: Projeto): string {
  return `https://${projeto.dominio}`;
}

export function ehSlugDeProjeto(v: unknown): v is SlugProjeto {
  return typeof v === "string" && PROJETOS.some((p) => p.slug === v);
}
