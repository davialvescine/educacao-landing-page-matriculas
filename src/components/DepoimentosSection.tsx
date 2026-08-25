import { Star } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/Secoes";

/* Avaliações públicas reais coletadas em 25/08/2026 —
   Quero Bolsa (Colégio Adventista Setor Pedro Ludovico, nota 4,97/5)
   e Google (Colégio Adventista de Águas Claras). */
const DEPOIMENTOS = [
  {
    texto:
      "Ótima escola com profissionais qualificados, estrutura ótima, ensino de alta qualidade. Eu e meu filho agradecemos pelo cuidado e atenção conosco.",
    nome: "Nathalia Francielly",
    papel: "Mãe de aluno",
    escola: "Colégio Adventista Setor Pedro Ludovico — Goiânia",
    fonte: "via Quero Bolsa",
  },
  {
    texto:
      "Uma escola que preza por valores e princípios cristãos. Muito além do ensino.",
    nome: "Ritha Brito",
    papel: "Aluna",
    escola: "Colégio Adventista Setor Pedro Ludovico — Goiânia",
    fonte: "via Quero Bolsa",
  },
  {
    texto:
      "Educação baseada em valores éticos e morais, com uma equipe pedagógica comprometida com o sucesso dos alunos.",
    nome: "Célia Ribeiro",
    papel: "Responsável",
    escola: "Colégio Adventista de Águas Claras — DF",
    fonte: "via Google",
  },
];

/** Prova social real antes do CTA final. */
export default function DepoimentosSection() {
  return (
    <section id="depoimentos" className="scroll-mt-10 bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-28">
        <Reveal>
          <Eyebrow>Quem vive, recomenda</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            O que as famílias dizem
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {DEPOIMENTOS.map((d, i) => (
            <Reveal key={d.nome} delay={i * 0.1} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="flex gap-1" aria-label="5 estrelas">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      aria-hidden
                      className="size-4 fill-gold-400 text-gold-400"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-grow text-[1.05rem] leading-relaxed text-ink">
                  “{d.texto}”
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="font-extrabold tracking-tight text-brand-900">
                    {d.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {d.papel} · {d.escola}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gold-600">
                    {d.fonte}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
