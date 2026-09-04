import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
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
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";
import BarraCtaMobile from "@/components/BarraCtaMobile";
import WhatsFlutuante from "@/components/WhatsFlutuante";
import Reveal from "@/components/Reveal";
import {
  Diferenciais,
  IabcDestaque,
  RedeMundialSection,
} from "@/components/Secoes";
import { construirRegioesSite, getFormEstados } from "@/lib/rede";
import { getWhatsappSobrescritos } from "@/lib/regioes";
import { SITE_NOME, SITE_URL } from "@/lib/site";

export default async function Home() {
  const estados = construirRegioesSite(await getWhatsappSobrescritos());
  const totalEscolas = estados.reduce((n, e) => n + e.escolas.length, 0);

  return (
    <>
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: SITE_NOME,
          url: SITE_URL,
          logo: `${SITE_URL}/imagens/campanha/logo-ea.png`,
          description:
            "Rede de Educação Adventista no Centro-Oeste brasileiro: 39 escolas particulares cristãs da Educação Infantil ao Ensino Médio no DF, GO, MS, MT e TO.",
          areaServed: ["DF", "GO", "MS", "MT", "TO"],
          sameAs: ["https://www.educacaoadventista.org.br/"],
          numberOfEmployees: { "@type": "QuantitativeValue", minValue: 1000 },
        }}
      />
      <Header />
      <main>
        <Hero
          fotos={[
            { src: "/imagens/campanha/amanda.webp", w: 1044, h: 1600 },
            { src: "/imagens/campanha/pedro.webp", w: 1440, h: 1600 },
            { src: "/imagens/campanha/camila.webp", w: 1467, h: 1600 },
            { src: "/imagens/campanha/sofia.webp", w: 1352, h: 1600 },
          ]}
        >
          <h1 className="sr-only">
            Educando gerações com valores pra vida. Educação Adventista
            Centro-Oeste
          </h1>
          <div
            className="hero-pop brilho-letras"
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

        <RedeMundialSection />

        <MapaRegioes />

        <NiveisSection />
        <Diferenciais />
        <UmDiaSection />
        <MundoSection />
        <DepoimentosSection />
        <IabcDestaque />
        <FaqSection />

        {/* Formulário (finale): minimalista, centrado, foco total no form */}
        <section
          id="matricula"
          className="relative scroll-mt-10 overflow-hidden bg-paper"
        >
          <div className="absolute inset-0">
            <Image
              src="/imagens/campanha/escola-robotica.jpg"
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
              <h2 className="mt-4 text-center text-4xl font-extrabold leading-[1.05] tracking-tighter text-brand-950 sm:text-6xl">
                Agora é a{" "}
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                  sua vez!
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-center text-lg leading-relaxed text-muted-foreground">
                Deixe seu contato e a equipe da unidade escolhida fala com você
                pelo WhatsApp para garantir a vaga.
              </p>
            </Reveal>
            <Reveal delay={0.12} className="mt-10">
              <LeadForm estados={getFormEstados()} />
            </Reveal>
            <ul className="relative mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
              {[
                "Resposta rápida no WhatsApp",
                "Atendimento humano, sem compromisso",
                "Vagas limitadas por turma",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    aria-hidden
                    className="size-4 shrink-0 text-gold-600"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <WhatsFlutuante
        regioes={estados.map((e) => ({
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

