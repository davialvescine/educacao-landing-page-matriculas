/** Configuração do site para SEO: URL canônica, nome e utilidades. */

export const SITE_NOME = "Educação Adventista Centro-Oeste";

/** URL pública do site. Defina NEXT_PUBLIC_SITE_URL no deploy. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://educaadventistacentrooeste.com.br"
).replace(/\/$/, "");

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
