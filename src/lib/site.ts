/** Configuração do site para SEO: URL canônica, nome e utilidades. */

export const SITE_NOME = "Educação Adventista Centro-Oeste";

/** URL pública do site. Defina NEXT_PUBLIC_SITE_URL no deploy. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://educaadventistacentrooeste.com.br"
).replace(/\/$/, "");

/** Instagram oficial da rede (bio confere: DF, GO, MT, MS e TO). */
export const INSTAGRAM_OFICIAL =
  "https://www.instagram.com/educacaoadventistacentrooeste/";

/**
 * Perfis oficiais da rede, para o sameAs da instituição.
 *
 * É o trabalho de entidade do GEO: o modelo de IA só reconhece a rede como
 * uma coisa só se encontrar o mesmo nome apontando para as mesmas fontes.
 * Só entram aqui endereços confirmados — perfil errado atrapalha mais do
 * que a ausência dele.
 *
 * A REDE PODE COMPLEMENTAR: Facebook e YouTube oficiais ainda não foram
 * informados.
 */
export const PERFIS_OFICIAIS: string[] = [
  "https://www.educacaoadventista.org.br/",
  INSTAGRAM_OFICIAL,
];

/** ID de medição do GA4 (propriedade Matrículas, conta UCOB - Educacional). */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-8ZSKJGD105";

/** Meta Pixel (Facebook/Instagram Ads). Vazio = desligado. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/** Slug de URL a partir de um nome (ex.: "Colégio Adventista de Taguatinga"). */
export function slugificar(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Número de WhatsApp em link clicável.
 * A base guarda telefone escrito para humano — "(65) 99360-3279" — e isso
 * não serve de href: vira link relativo e o clique não faz nada.
 */
export function linkWhatsapp(numero: string | null | undefined): string | null {
  if (!numero) return null;
  if (numero.startsWith("http")) return numero;
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/${digitos.startsWith("55") ? digitos : `55${digitos}`}`;
}
