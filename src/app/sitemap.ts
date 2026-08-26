import type { MetadataRoute } from "next";
import { getEstados, slugEscola } from "@/lib/rede";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const estados = getEstados();
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...estados.map((e) => ({
      url: `${SITE_URL}/${e.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...estados.flatMap((e) =>
      e.escolas.map((s) => ({
        url: `${SITE_URL}/${e.slug}/${slugEscola(s)}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
  ];
}
