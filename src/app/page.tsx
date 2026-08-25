import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero, { HeroCtas } from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import MapaRegioes from "@/components/MapaRegioes";
import Marquee from "@/components/Marquee";
import MundoSection from "@/components/MundoSection";
import NiveisSection from "@/components/NiveisSection";
import UmDiaSection from "@/components/UmDiaSection";
import DepoimentosSection from "@/components/DepoimentosSection";
import BarraCtaMobile from "@/components/BarraCtaMobile";
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

        <MapaRegioes />

        <NiveisSection />
        <Diferenciais />
        <UmDiaSection />
        <MundoSection />
        <DepoimentosSection />
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
          <div className="relative mx-auto grid max-w-7xl items-stretch gap-x-14 px-4 lg:grid-cols-2">
            <div className="flex flex-col pt-28 lg:pb-0">
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
              </Reveal>
              {/* Dupla de alunos ancorada na base da seção, como na arte */}
              <div className="relative mt-auto hidden items-end justify-center gap-0 pt-14 lg:flex">
                <Image
                  src="/imagens/campanha/pedro.webp"
                  alt="Aluno do Ensino Médio da Educação Adventista"
                  width={1440}
                  height={1600}
                  className="h-[26rem] w-auto"
                />
                <Image
                  src="/imagens/campanha/malu.webp"
                  alt="Aluna da Educação Infantil da Educação Adventista"
                  width={1160}
                  height={1600}
                  className="-ml-28 h-[19rem] w-auto"
                />
              </div>
            </div>
            <Reveal delay={0.15} className="py-28">
              <LeadForm estados={getFormEstados()} />
            </Reveal>
          </div>
        </section>
      </main>
      <BarraCtaMobile />
      <Footer />
    </>
  );
}

