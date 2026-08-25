import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero, { HeroCtas } from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { Diferenciais, IabcDestaque, StatsStrip } from "@/components/Secoes";
import { getEstados, getFormEstados } from "@/lib/rede";

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
              className="h-auto w-full max-w-xl drop-shadow-[0_10px_24px_rgba(120,60,0,0.18)]"
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

        <StatsStrip />

        {/* Regiões */}
        <section id="regioes" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
              Encontre uma escola perto de você
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Escolha a sua região e conheça as unidades, endereços e canais de
              matrícula.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {estados.map((e, i) => {
              const capa = e.escolas.find((s) => s.foto)?.foto;
              return (
                <Reveal key={e.slug} delay={(i % 3) * 0.1}>
                  <Link
                    href={`/${e.slug}`}
                    className="group block overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <div className="relative aspect-[16/9] bg-brand-100">
                      {capa ? (
                        <Image
                          src={`/${capa}`}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950">
                          <span className="text-3xl font-extrabold text-primary-foreground/40">
                            {e.uf}
                          </span>
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-brand-950/85 px-3 py-1 text-xs font-bold text-primary-foreground">
                        {e.escolas.length}{" "}
                        {e.escolas.length === 1 ? "unidade" : "unidades"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <div>
                        <h3 className="font-bold text-brand-900">{e.nome}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {e.associacao}
                        </p>
                      </div>
                      <ArrowRight
                        aria-hidden
                        className="size-5 text-brand-400 transition-transform group-hover:translate-x-1.5"
                      />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        <Diferenciais />
        <IabcDestaque />

        {/* Formulário */}
        <section id="matricula" className="scroll-mt-20 bg-brand-50/60">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-24 lg:grid-cols-2">
            <Reveal className="lg:sticky lg:top-28">
              <span className="inline-block rounded-full bg-gold-400 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-brand-950">
                Vagas limitadas
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
                Agora é a sua vez!
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
                Deixe seu contato e a equipe da unidade escolhida fala com você
                pelo WhatsApp para garantir a vaga — rápido, sem compromisso e
                sem fila.
              </p>
              <Image
                src="/imagens/campanha/daniel.webp"
                alt="Aluno do Ensino Médio da Educação Adventista"
                width={2004}
                height={2200}
                className="mt-10 hidden w-full max-w-sm lg:block h-auto drop-shadow-foto"
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
