import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero, { HeroCtas } from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import UnidadeCard from "@/components/UnidadeCard";
import { Diferenciais, StatsStrip } from "@/components/Secoes";
import { getEstado, getEstados, getFormEstados } from "@/lib/rede";

/** Fotos oficiais da campanha, alternadas entre as regiões. */
const FOTOS: Record<string, { src: string; w: number; h: number }> = {
  "distrito-federal": { src: "/imagens/campanha/daniel.webp", w: 2004, h: 2200 },
  goias: { src: "/imagens/campanha/camila.webp", w: 2016, h: 2200 },
  "mato-grosso-do-sul": { src: "/imagens/campanha/amanda.webp", w: 1435, h: 2200 },
  "oeste-mt": { src: "/imagens/campanha/daniel.webp", w: 2004, h: 2200 },
  tocantins: { src: "/imagens/campanha/amanda.webp", w: 1435, h: 2200 },
  "leste-mt": { src: "/imagens/campanha/camila.webp", w: 2016, h: 2200 },
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
    title: `Matrículas Abertas — ${estado.nome}`,
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
        <Hero foto={foto.src} fotoLargura={foto.w} fotoAltura={foto.h}>
          <nav
            aria-label="Trilha de navegação"
            className="hero-enter text-sm font-semibold text-brand-950/60"
            style={{ "--delay": "0.1s" } as React.CSSProperties}
          >
            <Link href="/" className="transition-colors hover:text-brand-800">
              Início
            </Link>{" "}
            / {estado.nome}
          </nav>
          <span
            className="hero-enter inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-cta"
            style={{ "--delay": "0.15s" } as React.CSSProperties}
          >
            Matrículas Abertas!
          </span>
          <h1
            className="hero-pop text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-800 sm:text-5xl lg:text-6xl"
            style={{ "--delay": "0.22s" } as React.CSSProperties}
          >
            Educação Adventista
            <br />
            <span className="text-primary-foreground [text-shadow:0_4px_18px_rgba(18,38,158,0.35)]">
              {estado.nome}
            </span>
          </h1>
          <p
            className="hero-enter max-w-xl text-lg font-medium leading-relaxed text-brand-950/80"
            style={{ "--delay": "0.3s" } as React.CSSProperties}
          >
            {estado.escolas.length}{" "}
            {estado.escolas.length === 1 ? "unidade" : "unidades"} da{" "}
            {estado.associacao} esperando por você — da Educação Infantil ao
            Ensino Médio.
          </p>
          <HeroCtas whatsapp={estado.whatsapp.link} />
        </Hero>

        {/* Unidades */}
        <section className="mx-auto max-w-7xl px-4 py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
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

        <StatsStrip />
        <Diferenciais />

        {/* Formulário */}
        <section id="matricula" className="scroll-mt-20 bg-brand-50/60">
          <div className="mx-auto max-w-2xl px-4 py-24">
            <Reveal>
              <h2 className="text-center text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
                Garanta sua vaga em {estado.nome}
              </h2>
              <p className="mt-3 text-center text-muted-foreground">
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
      <Footer />
    </>
  );
}
