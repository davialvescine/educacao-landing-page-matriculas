/** Injeta dados estruturados (schema.org) para SEO/GEO. */
export default function JsonLd({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
