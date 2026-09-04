import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { Eyebrow } from "@/components/Secoes";
import { cn } from "@/lib/utils";
import type { Pergunta } from "@/lib/faq";

interface Props {
  perguntas: Pergunta[];
  titulo: string;
  /** Linha de apoio abaixo do título. */
  chamada?: string;
  eyebrow?: string;
  /** Classes do fundo da seção; o padrão é o da home. */
  className?: string;
  id?: string;
}

/**
 * Bloco de perguntas frequentes: a sanfona visível mais a marcação FAQPage.
 * Os dois saem do mesmo array de propósito — o buscador rejeita marcação que
 * não bate com o texto que a pessoa vê na página.
 */
export default function FaqBloco({
  perguntas,
  titulo,
  chamada,
  eyebrow = "Perguntas frequentes",
  className,
  id = "perguntas",
}: Props) {
  if (perguntas.length === 0) return null;

  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-10 overflow-hidden bg-brand-50 [background-image:radial-gradient(ellipse_620px_320px_at_50%_100%,rgba(248,192,56,0.14),transparent_70%)]",
        className,
      )}
    >
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: perguntas.map((q) => ({
            "@type": "Question",
            name: q.p,
            acceptedAnswer: { "@type": "Answer", text: q.r },
          })),
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-28">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            {titulo}
          </h2>
          {chamada && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              {chamada}
            </p>
          )}
        </Reveal>
        <div className="mt-12 flex flex-col gap-3">
          {perguntas.map((q, i) => (
            <Reveal key={q.p} delay={(i % 3) * 0.06}>
              <details className="group rounded-2xl border border-line bg-surface shadow-card transition-shadow open:shadow-card-hover">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-extrabold tracking-tight text-brand-900 [&::-webkit-details-marker]:hidden">
                  {q.p}
                  <ChevronDown
                    aria-hidden
                    className="size-5 shrink-0 text-gold-600 transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {q.r}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
