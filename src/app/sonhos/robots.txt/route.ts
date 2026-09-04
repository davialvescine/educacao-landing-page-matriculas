import { PROJETOS, urlDoProjeto } from "@/lib/projetos";

/**
 * robots.txt do domínio da landing.
 *
 * A convenção robots.ts do Next só vale na raiz de app/, e a raiz já é do
 * site de matrículas. Aqui vai como rota explícita, e o proxy reescreve
 * /robots.txt para cá quando o host é o da landing.
 *
 * Cada domínio precisa apontar para o próprio sitemap: um sitemap só
 * servido nos dois faria o buscador achar as 46 páginas de matrículas
 * oferecidas também neste endereço — conteúdo duplicado, e os dois caem.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const projeto = PROJETOS.find((p) => p.slug === "educacao-dos-sonhos")!;
  const url = urlDoProjeto(projeto);

  const corpo = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${url}/sitemap.xml`,
    `Host: ${url}`,
    "",
  ].join("\n");

  return new Response(corpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
