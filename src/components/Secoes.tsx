import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRede } from "@/lib/rede";

/** Rótulo pequeno acima dos títulos de seção. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-brand-500">
      <span aria-hidden className="text-gold-500">
        ✦
      </span>
      {children}
      <span aria-hidden className="text-gold-500">
        ✦
      </span>
    </p>
  );
}

export function StatsStrip() {
  const rede = getRede();
  return (
    <section className="bg-brand-950">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-16 text-center sm:grid-cols-3 lg:grid-cols-5">
        {rede.estatisticas.map((s, i) => (
          <Reveal key={s.rotulo} delay={i * 0.07}>
            <p className="text-4xl font-extrabold tracking-tighter text-gold-400 sm:text-5xl">
              <CountUp valor={s.valor} />
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/60">
              {s.rotulo}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const ICONES_DIFERENCIAIS = [
  "/imagens/icones/icon1.png",
  "/imagens/icones/icon2.png",
  "/imagens/icones/icon3.png",
  "/imagens/icones/icon4.png",
  "/imagens/icones/icon5.png",
];

const DESCRICOES: Record<string, string> = {
  "Educação Integral":
    "Conhecimento acadêmico aliado ao desenvolvimento físico, emocional e espiritual.",
  "Presente em Todo o Centro-Oeste":
    "São 39 unidades em 6 regiões — sempre existe uma escola perto de você.",
  "Valores Cristãos que Transformam":
    "Princípios e valores permanentes que acompanham o aluno por toda a vida.",
  "Ambiente Saudável e Inspirador":
    "Estrutura moderna, ambientes acolhedores e tecnologia a serviço do aprender.",
  "Cidadania e Propósito":
    "Formamos cidadãos que fazem a diferença hoje, com excelência e propósito.",
};

/** Bento grid: card de foto alto + 5 diferenciais numerados + tile de CTA. */
export function Diferenciais() {
  const rede = getRede();
  return (
    <section id="diferenciais" className="scroll-mt-10 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-28">
        <Reveal>
          <Eyebrow>Nossos diferenciais</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            Por que escolher a<br className="hidden sm:block" /> Educação
            Adventista?
          </h2>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[15rem]">
          {/* Tile foto — 2 colunas × 2 linhas */}
          <Reveal className="lg:col-span-2 lg:row-span-2">
            <div className="relative h-full min-h-[22rem] overflow-hidden rounded-2xl bg-gold-400">
              <Image
                src="/imagens/campanha/hero-bg.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <Image
                src="/imagens/fotos/alunos2.png"
                alt="Alunos da Educação Adventista"
                width={584}
                height={700}
                className="absolute bottom-0 left-1/2 z-10 w-[85%] -translate-x-1/2 drop-shadow-foto"
              />
              <p className="absolute left-5 top-5 z-20 max-w-[80%] text-2xl font-extrabold leading-tight tracking-tight text-brand-950">
                Muito além
                <br />
                do ensino.
              </p>
            </div>
          </Reveal>

          {rede.diferenciais.map((d, i) => (
            <Reveal key={d} delay={(i % 2) * 0.08} className="lg:col-span-2">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-paper p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-6 text-[5.5rem] font-extrabold tracking-tighter text-brand-100/80 transition-colors duration-300 group-hover:text-gold-200"
                >
                  0{i + 1}
                </span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gold-200">
                  <Image
                    src={ICONES_DIFERENCIAIS[i % ICONES_DIFERENCIAIS.length]}
                    alt=""
                    width={56}
                    height={56}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <h3 className="relative mt-4 text-lg font-extrabold leading-snug tracking-tight text-brand-900">
                  {d}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {DESCRICOES[d] ?? ""}
                </p>
              </div>
            </Reveal>
          ))}

          {/* Tile CTA */}
          <Reveal delay={0.12} className="lg:col-span-2">
            <Link
              href="/#matricula"
              className="group flex h-full min-h-[10rem] flex-col justify-between rounded-2xl bg-brand-700 p-6 text-primary-foreground shadow-cta transition-all duration-300 hover:-translate-y-1 hover:bg-brand-600"
            >
              <p className="text-xl font-extrabold leading-snug tracking-tight">
                Pronto para fazer
                <br />
                parte dessa história?
              </p>
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold-300">
                Quero fazer parte
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-1.5"
                />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function IabcDestaque() {
  const rede = getRede();
  return (
    <section id="iabc" className="scroll-mt-10 bg-brand-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 md:flex-row">
        <Reveal>
          <Image
            src="/imagens/logos/Logo-IABC.png"
            alt="IABC — Instituto Adventista Brasil Central"
            width={220}
            height={120}
            className="h-24 w-auto object-contain"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-extrabold tracking-tighter text-primary-foreground sm:text-4xl">
            Conheça o IABC — nosso internato
          </h2>
          <p className="mt-3 leading-relaxed text-primary-foreground/75">
            O Instituto Adventista Brasil Central reúne educação de excelência e
            estrutura completa de internato, em Abadiânia (GO). Um lugar onde o
            aluno vive, estuda e cresce com propósito.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <a
            href={rede.iabc.site}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-13 shrink-0 rounded-full bg-gold-400 px-7 font-bold text-brand-950 hover:bg-gold-300",
            )}
          >
            Visitar o IABC
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
