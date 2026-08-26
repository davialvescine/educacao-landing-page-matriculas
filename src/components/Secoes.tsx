import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import CountUp from "@/components/CountUp";
import CtaIabc from "@/components/CtaIabc";
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

export function StatsTiles({ claro = false }: { claro?: boolean }) {
  const rede = getRede();
  return (
    <div
      className={`grid grid-cols-2 gap-y-8 text-center sm:grid-cols-3 lg:flex lg:justify-center lg:gap-y-0 lg:divide-x ${claro ? "lg:divide-brand-900/10" : "lg:divide-white/10"}`}
    >
      {rede.estatisticas.map((s, i) => (
        <Reveal key={s.rotulo} delay={i * 0.07} className="px-4 lg:px-12">
          <p
            className={`text-4xl font-extrabold tracking-tighter xl:text-5xl ${claro ? "text-brand-800" : "text-gold-400"}`}
          >
            <CountUp valor={s.valor} />
          </p>
          <p
            className={`mt-2 text-[11px] font-bold uppercase tracking-widest ${claro ? "text-muted-foreground" : "text-primary-foreground/50"}`}
          >
            {s.rotulo}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

/** Seção-destaque da rede mundial: a frase como título e os números como prova. */
export function RedeMundialSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-paper via-surface to-gold-100/40 py-20">
      <div
        aria-hidden
        className="anim-aurora absolute -top-36 left-1/2 h-[22rem] w-[44rem] -translate-x-1/2 rounded-full bg-gold-300/30 blur-[110px]"
      />
      <div className="relative mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-gold-600">
            <span aria-hidden>✦</span> Uma decisão maior do que parece
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold leading-tight tracking-tighter text-brand-950 sm:text-4xl">
            Você não está matriculando em uma escola.{" "}
            <span className="bg-gradient-to-r from-gold-500 via-gold-600 to-gold-500 bg-clip-text text-transparent">
              Está entrando em uma rede mundial.
            </span>
          </h2>
        </Reveal>
        <div className="mt-12">
          <StatsTiles claro />
        </div>
      </div>
    </section>
  );
}

export function StatsStrip() {
  return (
    <section className="bg-brand-950">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <StatsTiles />
      </div>
    </section>
  );
}

/** Fotos reais do campus do IABC para o carrossel do internato. */
const FOTOS_IABC = [
  { src: "/imagens/iabc/campus-aereo.jpg", legenda: "Um campus inteiro para viver e estudar" },
  { src: "/imagens/iabc/vida-esporte.jpg", legenda: "Esporte e conquistas" },
  { src: "/imagens/iabc/vida-musica.jpg", legenda: "Música e louvor" },
  { src: "/imagens/iabc/vida-estudo.jpg", legenda: "Estudo com propósito" },
  { src: "/imagens/iabc/vida-natacao.jpg", legenda: "Esportes aquáticos" },
  { src: "/imagens/iabc/vida-amizade.jpg", legenda: "Amizades para a vida" },
  { src: "/imagens/iabc/campus-dormitorio.jpg", legenda: "Dormitórios modernos" },
  { src: "/imagens/iabc/vida-missao.jpg", legenda: "Missão e serviço" },
];

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
    "São 39 unidades em 6 regiões: sempre existe uma escola perto de você.",
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
    <section
      id="diferenciais"
      className="scroll-mt-10 border-y border-brand-100 bg-brand-50 [background-image:linear-gradient(rgba(83,114,236,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(83,114,236,0.05)_1px,transparent_1px)] [background-size:44px_44px]"
    >
      <div className="mx-auto max-w-7xl px-4 py-28">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-brand-500">
                <span aria-hidden className="text-gold-500">✦</span>
                Nossos diferenciais
              </p>
              <h2 className="mt-4 text-5xl font-extrabold tracking-tighter text-brand-900 sm:text-6xl">
                Por que <span className="tarja text-brand-950">escolher</span> a
                <br />
                Educação Adventista?
              </h2>
            </div>
            <p className="max-w-sm leading-relaxed text-muted-foreground lg:pb-3">
              Cinco compromissos que acompanham cada aluno da matrícula à
              formatura, em todas as 39 unidades.
            </p>
          </div>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[13.5rem]">
          {/* Tile foto: 2 colunas × 2 linhas */}
          <Reveal className="lg:col-span-2 lg:row-span-2">
            <div className="relative h-full min-h-[24rem] overflow-hidden rounded-3xl bg-gold-400">
              <Image
                src="/imagens/campanha/hero-bg.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-gold-200/70 via-transparent to-gold-600/40"
              />
              <Image
                src="/imagens/campanha/daniel.webp"
                alt="Aluno da Educação Adventista"
                width={1457}
                height={1600}
                className="absolute bottom-0 left-1/2 z-10 h-[68%] w-auto -translate-x-1/2"
              />
              <p className="absolute inset-x-6 top-6 z-20 text-3xl font-extrabold leading-[1.05] tracking-tighter text-brand-950">
                Muito além
                <br />
                do ensino.
              </p>
            </div>
          </Reveal>

          {rede.diferenciais.map((d, i) => (
            <Reveal key={d} delay={(i % 2) * 0.08} className="lg:col-span-2">
              <div className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-card-hover">
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden
                    className="text-6xl font-extrabold leading-none tracking-tighter text-transparent [-webkit-text-stroke:2px_#b6c4fa] transition-all duration-300 group-hover:text-gold-400 group-hover:[-webkit-text-stroke:0px]"
                  >
                    0{i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/80 transition-colors duration-300 group-hover:bg-gold-400">
                    <Image
                      src={ICONES_DIFERENCIAIS[i % ICONES_DIFERENCIAIS.length]}
                      alt=""
                      width={56}
                      height={56}
                      className="h-6 w-6 object-contain"
                    />
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold leading-snug tracking-tight text-brand-900">
                  {d}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {DESCRICOES[d] ?? ""}
                </p>
              </div>
            </Reveal>
          ))}

          {/* Tile CTA: ocupa o restante da linha */}
          <Reveal delay={0.12} className="lg:col-span-4">
            <Link
              href="/#matricula"
              className="group relative flex h-full min-h-[10rem] items-center justify-between gap-6 overflow-hidden rounded-2xl bg-gold-400 p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <Image
                src="/imagens/campanha/hero-bg.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover opacity-40"
              />
              <p className="relative max-w-md text-2xl font-extrabold leading-snug tracking-tight text-brand-950 sm:text-3xl">
                Pronto para fazer parte dessa história?
              </p>
              <span className="relative flex shrink-0 items-center gap-3 rounded-full bg-brand-700 px-7 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-cta transition-colors group-hover:bg-brand-600">
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
    <section id="iabc" className="relative scroll-mt-10 overflow-hidden bg-brand-950">
      <Image
        src="/imagens/campanha/iabc-campus.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[center_58%] opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/55 to-brand-950/95"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-24 md:flex-row">
        <Reveal>
          <Image
            src="/imagens/logos/Logo-IABC.png"
            alt="IABC, Instituto Adventista Brasil Central"
            width={220}
            height={120}
            className="h-24 w-auto object-contain"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-extrabold tracking-tighter text-primary-foreground sm:text-4xl">
            Conheça o IABC, nosso internato
          </h2>
          <p className="mt-3 leading-relaxed text-primary-foreground/75">
            O Instituto Adventista Brasil Central reúne educação de excelência e
            estrutura completa de internato, em Abadiânia (GO). Um lugar onde o
            aluno vive, estuda e cresce com propósito.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
          <CtaIabc />
          <a
            href={rede.iabc.site}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-13 shrink-0 rounded-full border-2 border-white/30 bg-transparent px-6 font-bold text-white hover:bg-white/10",
            )}
          >
            Conhecer o site
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Reveal>
      </div>

      {/* Carrossel: a vida no internato passando em fotos reais do campus */}
      <div className="esteira-pausavel relative pb-24">
        <div className="overflow-hidden">
          <div className="anim-esteira flex w-max gap-4 pr-4">
            {[false, true].map((duplicada) => (
              <div
                key={String(duplicada)}
                aria-hidden={duplicada || undefined}
                className="flex shrink-0 gap-4"
              >
                {FOTOS_IABC.map((f) => (
                  <figure
                    key={f.src}
                    className="group relative h-56 w-[19rem] shrink-0 overflow-hidden rounded-2xl sm:h-64 sm:w-[23rem]"
                  >
                    <Image
                      src={f.src}
                      alt={duplicada ? "" : f.legenda}
                      fill
                      sizes="368px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-transparent to-transparent"
                    />
                    <figcaption className="absolute inset-x-4 bottom-3 text-sm font-extrabold tracking-tight text-white">
                      {f.legenda}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Fades nas bordas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-brand-950/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-brand-950/80 to-transparent"
        />
      </div>
    </section>
  );
}
