import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/Secoes";

const NIVEIS = [
  {
    nome: "Educação Infantil",
    faixa: "2 a 5 anos",
    texto: "Acolhimento, descoberta e fé desde os primeiros passos.",
    foto: "/imagens/campanha/malu.webp",
    w: 1160,
    h: 1600,
  },
  {
    nome: "Anos Iniciais",
    faixa: "1º ao 5º ano",
    texto: "Base sólida de leitura, lógica e valores para a vida.",
    foto: "/imagens/campanha/marlon.webp",
    w: 1088,
    h: 1600,
  },
  {
    nome: "Anos Finais",
    faixa: "6º ao 9º ano",
    texto: "Autonomia, pensamento crítico e projetos que transformam.",
    foto: "/imagens/campanha/sofia.webp",
    w: 1352,
    h: 1600,
  },
  {
    nome: "Ensino Médio",
    faixa: "1ª a 3ª série",
    texto: "Preparo para o vestibular e um projeto de vida com propósito.",
    foto: "/imagens/campanha/pedro.webp",
    w: 1440,
    h: 1600,
  },
];

/** Da Educação Infantil ao Ensino Médio — com os alunos da campanha. */
export default function NiveisSection() {
  return (
    <section id="niveis" className="scroll-mt-10 bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-28">
        <Reveal>
          <Eyebrow>Para cada fase, um caminho</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            Da Educação Infantil
            <br className="hidden sm:block" /> ao Ensino Médio
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {NIVEIS.map((n, i) => (
            <Reveal key={n.nome} delay={i * 0.08} className="h-full">
              <Link
                href="#matricula"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
              >
                <div className="relative flex h-64 items-end justify-center overflow-hidden bg-gradient-to-b from-gold-200 via-gold-300 to-gold-400">
                  <Image
                    src="/imagens/campanha/hero-bg.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover opacity-30"
                  />
                  <Image
                    src={n.foto}
                    alt={`Estudante — ${n.nome}`}
                    width={n.w}
                    height={n.h}
                    className="relative z-10 h-[88%] w-auto transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 z-20 rounded-full bg-brand-950/80 px-3 py-1 text-xs font-bold text-white">
                    {n.faixa}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-lg font-extrabold tracking-tight text-brand-900">
                    {n.nome}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {n.texto}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-widest text-brand-600">
                    Quero para meu filho
                    <ArrowRight
                      aria-hidden
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
