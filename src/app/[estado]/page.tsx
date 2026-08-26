import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero, { HeroCtas } from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import BarraCtaMobile from "@/components/BarraCtaMobile";
import WhatsFlutuante from "@/components/WhatsFlutuante";
import DepoimentosSection from "@/components/DepoimentosSection";
import UnidadeCard from "@/components/UnidadeCard";
import { Diferenciais, Eyebrow } from "@/components/Secoes";
import { getEstado, getEstados, getFormEstados } from "@/lib/rede";

/** Fotos oficiais da campanha, alternadas entre as regiões. */
const FOTOS: Record<string, { src: string; w: number; h: number }> = {
  "distrito-federal": { src: "/imagens/campanha/pedro.webp", w: 1440, h: 1600 },
  goias: { src: "/imagens/campanha/camila.webp", w: 1467, h: 1600 },
  "mato-grosso-do-sul": { src: "/imagens/campanha/daniel.webp", w: 1457, h: 1600 },
  "oeste-mt": { src: "/imagens/campanha/sofia.webp", w: 1352, h: 1600 },
  tocantins: { src: "/imagens/campanha/marlon.webp", w: 1088, h: 1600 },
  "leste-mt": { src: "/imagens/campanha/malu.webp", w: 1160, h: 1600 },
};

export function generateStaticParams() {
  return getEstados().map((e) => ({ estado: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[estado]">): Promise<Metadata> {
  const { estado: slug } = await params;
  const estado = getEstado(slug);
  if (!estado) return {};
  return {
    title: `Matrículas Abertas · ${estado.nome}`,
    description: `Escolas Adventistas em ${estado.nome}: ${estado.escolas.length} unidades com matrículas abertas. Encontre a mais próxima e garanta sua vaga.`,
  };
}

export default async function EstadoPage({ params }: PageProps<"/[estado]">) {
  const { estado: slug } = await params;
  const estado = getEstado(slug);
  if (!estado) notFound();
  const foto = FOTOS[estado.slug] ?? FOTOS["goias"];

  return (
    <>
      <Header />
      <main>
        <Hero compacto foto={foto.src} fotoLargura={foto.w} fotoAltura={foto.h}>
          <span
            className="hero-enter inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-cta"
            style={{ "--delay": "0.05s" } as React.CSSProperties}
          >
            Matrículas Abertas!
          </span>
          <h1
            className="hero-pop brilho-letras text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-800 sm:text-5xl lg:text-6xl"
            style={{ "--delay": "0.22s" } as React.CSSProperties}
          >
            Educação Adventista
            <br />
            <span className="text-white">
              {estado.nome}
            </span>
          </h1>
          <p
            className="hero-enter max-w-xl text-lg font-medium leading-relaxed text-brand-950/80"
            style={{ "--delay": "0.3s" } as React.CSSProperties}
          >
            {estado.escolas.length}{" "}
            {estado.escolas.length === 1 ? "unidade" : "unidades"} da{" "}
            {estado.associacao} esperando por você, da Educação Infantil ao
            Ensino Médio.
          </p>
          <HeroCtas whatsapp={estado.whatsapp.link} />
        </Hero>

        {/* Unidades */}
        <section className="mx-auto max-w-7xl px-4 py-24">
          <Reveal>
            <Eyebrow>{estado.associacao}</Eyebrow>
            <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
              Nossas unidades
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Escolha a mais perto de você e fale direto com a nossa equipe.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {estado.escolas.map((s, i) => (
              <Reveal key={s.nome} delay={(i % 3) * 0.1}>
                <UnidadeCard escola={s} estado={estado} />
              </Reveal>
            ))}
          </div>
        </section>

        <Diferenciais />
        <DepoimentosSection />

        {/* Formulário (finale) */}
        <section
          id="matricula"
          className="relative scroll-mt-10 overflow-hidden bg-paper"
        >
          <div className="absolute inset-0">
            <Image
              src="/imagens/campanha/escola-ciencias.jpg"
              alt=""
              fill
              sizes="100vw"
              className="anim-zoom-lento object-cover opacity-25"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-paper via-paper/85 to-paper"
            />
          </div>
          <div className="relative mx-auto max-w-2xl px-4 py-28">
            <Reveal>
              <p className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-gold-600">
                <span aria-hidden>✦</span> Vagas limitadas
              </p>
              <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-950 sm:text-5xl">
                Garanta sua vaga em {estado.nome}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
                Deixe seu contato e a equipe da unidade fala com você pelo
                WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={0.12} className="mt-10">
              <LeadForm estados={getFormEstados()} estadoInicial={estado.slug} />
            </Reveal>
          </div>
        </section>
      </main>
      <WhatsFlutuante
        linkDireto={estado.whatsapp.link}
        regioes={getEstados().map((e) => ({
          slug: e.slug,
          nome: e.nome,
          link: e.whatsapp.link,
        }))}
      />
      <BarraCtaMobile />
      <Footer />
    </>
  );
}
