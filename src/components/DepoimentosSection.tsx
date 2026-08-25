import { Star } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/Secoes";

/* Avaliações públicas reais coletadas em 25/08/2026 nas plataformas
   Quero Bolsa, Melhor Escola e Google (páginas públicas das escolas).
   Validar/atualizar com a equipe antes de campanhas pagas. */
const DEPOIMENTOS = [
  {
    texto:
      "Ótima escola com profissionais qualificados, estrutura ótima, ensino de alta qualidade. Eu e meu filho agradecemos pelo cuidado e atenção conosco.",
    nome: "Nathalia Francielly",
    papel: "Mãe de aluno",
    escola: "Colégio Adventista Setor Pedro Ludovico · Goiânia",
    fonte: "via Quero Bolsa",
  },
  {
    texto:
      "Uma escola que preza por valores e princípios cristãos. Muito além do ensino.",
    nome: "Ritha Brito",
    papel: "Aluna",
    escola: "Colégio Adventista Setor Pedro Ludovico · Goiânia",
    fonte: "via Quero Bolsa",
  },
  {
    texto:
      "Educação baseada em valores éticos e morais, com uma equipe pedagógica comprometida com o sucesso dos alunos.",
    nome: "Célia Ribeiro",
    papel: "Responsável",
    escola: "Colégio Adventista de Águas Claras · DF",
    fonte: "via Google",
  },
  {
    texto:
      "Essa escola vai ficar sempre marcada em minha vida. Foi aí que fiz os melhores amigos que irei levar para toda a vida.",
    nome: "Carolina Medeiros",
    papel: "Ex-aluna",
    escola: "Escola Adventista de Palmas · TO",
    fonte: "via Melhor Escola",
  },
  {
    texto:
      "Escola maravilhosa!! Com princípios cristãos e ensino de qualidade.",
    nome: "Elani Bezerra",
    papel: "Mãe de aluno",
    escola: "Colégio Adventista de Araguaína · TO",
    fonte: "via Melhor Escola",
  },
  {
    texto:
      "Conheci a estrutura da escola e as referências são as melhores.",
    nome: "Maria do Carmo da Rocha",
    papel: "Mãe",
    escola: "Colégio Adventista de Taguatinga · DF",
    fonte: "via Melhor Escola",
  },
];

const LINHA_1 = DEPOIMENTOS.slice(0, 3);
const LINHA_2 = DEPOIMENTOS.slice(3);

function CartaoDepoimento({ d }: { d: (typeof DEPOIMENTOS)[number] }) {
  return (
    <figure className="flex h-full w-[340px] shrink-0 flex-col rounded-2xl border border-line bg-surface p-6 shadow-card sm:w-[400px]">
      <div className="flex gap-1" aria-label="5 estrelas">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} aria-hidden className="size-4 fill-gold-400 text-gold-400" />
        ))}
      </div>
      <blockquote className="mt-3 flex-grow text-[0.98rem] leading-relaxed text-ink">
        “{d.texto}”
      </blockquote>
      <figcaption className="mt-5 border-t border-line pt-3">
        <p className="font-extrabold tracking-tight text-brand-900">{d.nome}</p>
        <p className="text-xs text-muted-foreground">
          {d.papel} · {d.escola}
        </p>
      </figcaption>
    </figure>
  );
}

function Esteira({
  itens,
  reverso = false,
}: {
  itens: typeof DEPOIMENTOS;
  reverso?: boolean;
}) {
  /* Track com 2 metades idênticas (loop -50%); cada metade repete os
     cartões 3× para cobrir telas largas sem emenda visível. */
  const metade = [...itens, ...itens, ...itens];
  return (
    <div className={`flex w-max ${reverso ? "anim-esteira-rev" : "anim-esteira"}`}>
      {[false, true].map((duplicada) => (
        <div
          key={String(duplicada)}
          aria-hidden={duplicada || undefined}
          className="flex items-stretch gap-5 pr-5"
        >
          {metade.map((d, i) => (
            <CartaoDepoimento key={`${d.nome}-${i}`} d={d} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Prova social real em esteiras infinitas (pausam no hover). */
export default function DepoimentosSection() {
  return (
    <section id="depoimentos" className="scroll-mt-10 overflow-hidden bg-paper">
      <div className="mx-auto max-w-7xl px-4 pt-28">
        <Reveal>
          <Eyebrow>Quem vive, recomenda</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            O que as famílias dizem
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Avaliações reais de famílias da rede.
          </p>
        </Reveal>
      </div>
      <div className="esteira-pausavel relative mt-14 flex flex-col gap-5 pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent"
        />
        <Esteira itens={LINHA_1} />
        <Esteira itens={LINHA_2} reverso />
      </div>
    </section>
  );
}
