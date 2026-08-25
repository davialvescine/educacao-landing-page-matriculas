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

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[partes.length - 1]?.[0] ?? "")).toUpperCase();
}

function CartaoDepoimento({ d }: { d: (typeof DEPOIMENTOS)[number] }) {
  return (
    <figure className="relative flex h-full w-[360px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white bg-white/95 p-7 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover sm:w-[420px]">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-10 font-serif text-[7.5rem] leading-none text-gold-300/50"
      >
        &ldquo;
      </span>
      <figcaption className="relative flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-extrabold text-brand-950 shadow-[0_6px_14px_rgba(248,160,16,0.35)]">
          {iniciais(d.nome)}
        </span>
        <span>
          <span className="block font-extrabold tracking-tight text-brand-900">
            {d.nome}
          </span>
          <span className="block text-xs text-muted-foreground">
            {d.papel} · {d.escola}
          </span>
        </span>
      </figcaption>
      <blockquote className="relative mt-4 flex-grow text-[1.02rem] leading-relaxed text-ink">
        {d.texto}
      </blockquote>
      <div className="relative mt-5 flex gap-1 border-t border-line pt-4" aria-label="5 estrelas">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} aria-hidden className="size-4 fill-gold-400 text-gold-400" />
        ))}
      </div>
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
    <section
      id="depoimentos"
      className="relative scroll-mt-10 overflow-hidden bg-gradient-to-b from-paper via-gold-100/70 to-paper"
    >
      {/* Mosaico da campanha bem sutil + auroras */}
      <div aria-hidden className="absolute inset-0 opacity-[0.05] [background-image:url(/imagens/campanha/hero-bg.jpg)] [background-size:cover] [background-position:center]" />
      <div aria-hidden className="anim-aurora absolute -left-40 top-10 h-[26rem] w-[26rem] rounded-full bg-gold-300/50 blur-[110px]" />
      <div aria-hidden className="anim-aurora absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-brand-200/60 blur-[110px]" style={{ animationDelay: "-8s" }} />
      <div className="relative mx-auto max-w-7xl px-4 pt-28">
        <Reveal>
          <div className="relative text-center">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 font-serif text-[14rem] leading-none text-gold-400/30"
            >
              &ldquo;
            </span>
            <Eyebrow>Quem vive, recomenda</Eyebrow>
            <h2 className="relative mt-4 text-5xl font-extrabold tracking-tighter text-brand-900 sm:text-6xl">
              O que as <span className="tarja text-brand-950">famílias</span>
              <br className="sm:hidden" /> dizem
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Avaliações reais de famílias da rede.
            </p>
          </div>
        </Reveal>
      </div>
      <div className="esteira-pausavel relative mt-16 flex flex-col gap-5 pb-28">
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
