import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero, { HeroCtas } from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import { Diferenciais, Eyebrow, IabcDestaque, StatsStrip } from "@/components/Secoes";
import { getEstados, getFormEstados } from "@/lib/rede";

/* Distribuição do bento grid das regiões (6 colunas no desktop). */
const BENTO: Record<string, string> = {
  "distrito-federal": "lg:col-span-4 lg:row-span-2",
  goias: "lg:col-span-2",
  "mato-grosso-do-sul": "lg:col-span-2",
  "oeste-mt": "lg:col-span-2",
  tocantins: "lg:col-span-2",
  "leste-mt": "lg:col-span-2",
};

export default function Home() {
  const estados = getEstados();
  const totalEscolas = estados.reduce((n, e) => n + e.escolas.length, 0);

  return (
    <>
      <Header />
      <main>
        <Hero>
          <h1 className="sr-only">
            Educando gerações com valores pra vida — Educação Adventista
            Centro-Oeste
          </h1>
          <div
            className="hero-pop"
            style={{ "--delay": "0.18s" } as React.CSSProperties}
          >
            <Image
              src="/imagens/campanha/slogan-valores.webp"
              alt="Educando gerações com valores pra vida"
              width={2000}
              height={900}
              priority
              className="h-auto w-full max-w-2xl drop-shadow-[0_10px_24px_rgba(120,60,0,0.18)]"
            />
          </div>
          <p
            className="hero-enter max-w-xl text-lg font-medium leading-relaxed text-brand-950/80"
            style={{ "--delay": "0.3s" } as React.CSSProperties}
          >
            Da Educação Infantil ao Ensino Médio, são{" "}
            <strong className="text-brand-800">{totalEscolas} escolas</strong> em
            6 regiões do Centro-Oeste esperando por você.
          </p>
          <HeroCtas />
        </Hero>

        <Marquee />
        <StatsStrip />

        {/* Regiões — bento grid */}
        <section id="regioes" className="mx-auto max-w-7xl scroll-mt-10 px-4 py-28">
          <Reveal>
            <Eyebrow>6 regiões, {totalEscolas} escolas</Eyebrow>
            <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
              Encontre uma escola
              <br className="hidden sm:block" /> perto de você
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[14rem]">
            {estados.map((e, i) => {
              const capa = e.escolas.find((s) => s.foto)?.foto;
              const grande = e.slug === "distrito-federal";
              return (
                <Reveal
                  key={e.slug}
                  delay={(i % 3) * 0.08}
                  className={BENTO[e.slug] ?? "lg:col-span-2"}
                >
                  <Link
                    href={`/${e.slug}`}
                    className="group relative block h-full min-h-[14rem] overflow-hidden rounded-2xl bg-brand-900 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    {capa && (
                      <Image
                        src={`/${capa}`}
                        alt=""
                        fill
                        sizes={
                          grande
                            ? "(max-width: 1024px) 100vw, 66vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        }
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent"
                    />
                    <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-brand-950/60 px-3 py-1 text-xs font-bold text-white">
                      {e.escolas.length}{" "}
                      {e.escolas.length === 1 ? "unidade" : "unidades"}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gold-300">
                          {e.associacao}
                        </p>
                        <h3 className={tituloRegiao(grande)}>{e.nome}</h3>
                      </div>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-all duration-300 group-hover:bg-gold-400 group-hover:text-brand-950">
                        <ArrowRight aria-hidden className="size-5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        <Diferenciais />
        <IabcDestaque />

        {/* Formulário — finale */}
        <section
          id="matricula"
          className="relative scroll-mt-10 overflow-hidden bg-brand-950"
        >
          <Image
            src="/imagens/campanha/hero-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.07]"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-28 lg:grid-cols-2">
            <Reveal>
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-gold-400">
                <span aria-hidden>✦</span> Vagas limitadas
              </p>
              <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tighter text-primary-foreground sm:text-6xl">
                Agora é a<br />
                sua vez!
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-primary-foreground/70">
                Deixe seu contato e a equipe da unidade escolhida fala com você
                pelo WhatsApp para garantir a vaga — rápido, sem compromisso e
                sem fila.
              </p>
              <Image
                src="/imagens/campanha/daniel.webp"
                alt="Aluno do Ensino Médio da Educação Adventista"
                width={2004}
                height={2200}
                className="mt-10 hidden h-auto w-full max-w-xs drop-shadow-foto lg:block"
              />
            </Reveal>
            <Reveal delay={0.15}>
              <LeadForm estados={getFormEstados()} />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function tituloRegiao(grande: boolean) {
  return grande
    ? "text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
    : "text-xl font-extrabold tracking-tight text-white";
}
