import type { MetadataRoute } from "next";
import { getRegioesSite, slugEscola } from "@/lib/rede";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const estados = getRegioesSite();
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
    {
      url: `${SITE_URL}/politica-de-privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
