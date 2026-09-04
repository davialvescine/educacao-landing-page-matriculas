import type { MetadataRoute } from "next";
import { PROJETOS, urlDoProjeto } from "@/lib/projetos";

/** Sitemap do domínio da landing — só as rotas dela. */
export default function sitemap(): MetadataRoute.Sitemap {
  const projeto = PROJETOS.find((p) => p.slug === "educacao-dos-sonhos")!;
  return [
    { url: urlDoProjeto(projeto), changeFrequency: "monthly", priority: 1 },
  ];
}
