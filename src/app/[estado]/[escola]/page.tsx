import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Navigation,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import FaqBloco from "@/components/FaqBloco";
import BarraCtaMobile from "@/components/BarraCtaMobile";
import WhatsFlutuante from "@/components/WhatsFlutuante";
import DepoimentosSection from "@/components/DepoimentosSection";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  cidadeDaUnidade,
  cidadeEscola,
  construirRegioesSite,
  getEscola,
  getRegioesSite,
  getFormEstados,
  getRede,
  nomeEscola,
  slugEscola,
  whatsappDaEscola,
} from "@/lib/rede";
import { perguntasEscola } from "@/lib/faq";
import { getWhatsappSobrescritos } from "@/lib/regioes";
import { SITE_NOME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getRegioesSite().flatMap((e) =>
    e.escolas.map((s) => ({ estado: e.slug, escola: slugEscola(s) })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[estado]/[escola]">): Promise<Metadata> {
  const { estado: estadoSlug, escola: escolaSlug } = await params;
  const dados = getEscola(estadoSlug, escolaSlug);
  if (!dados) return {};
  const nome = nomeEscola(dados.escola);
  // Duas localidades e ambas valem busca: o bairro que batiza a unidade
  // ("Taguatinga", "Setor Pedro Ludovico") e a cidade real do endereço.
  // Quando diferem, as duas entram na descrição.
  const cidade = cidadeDaUnidade(dados.escola);
  const bairro = cidadeEscola(dados.escola);
  const onde =
    cidade && bairro && cidade.toLowerCase() !== bairro.toLowerCase()
      ? `${bairro}, ${cidade}`
      : (cidade ?? bairro);
  return {
    title: `${nome}: Matrículas Abertas 2027`,
    description: `${nome}: escola particular cristã em ${onde} (${dados.estado.uf}), da Educação Infantil ao Ensino Médio. Rede Adventista, 130 anos de tradição. Agende uma visita pelo WhatsApp.`,
    alternates: {
      canonical: `${SITE_URL}/${estadoSlug}/${escolaSlug}`,
    },
  };
}

export default async function EscolaPage({
  params,
}: PageProps<"/[estado]/[escola]">) {
  const { estado: estadoSlug, escola: escolaSlug } = await params;
  const regioes = construirRegioesSite(await getWhatsappSobrescritos());
  const estado = regioes.find((e) => e.slug === estadoSlug);
  const escola = estado?.escolas.find((s) => slugEscola(s) === escolaSlug);
  if (!estado || !escola) notFound();
  const rede = getRede();
  const nome = nomeEscola(escola);
  const cidade = cidadeDaUnidade(escola) ?? cidadeEscola(escola);
  const url = `${SITE_URL}/${estado.slug}/${slugEscola(escola)}`;
  const linkMaps = escola.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome}, ${escola.endereco}`)}`
    : null;
  const whatsapp = whatsappDaEscola(escola, estado);

  return (
    <>
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "School",
          name: nome,
          url,
          ...(escola.foto ? { image: `${SITE_URL}/${escola.foto}` } : {}),
          ...(escola.telefone ? { telephone: escola.telefone } : {}),
          ...(escola.endereco
            ? {
                address: {
                  "@type": "PostalAddress",
                  streetAddress: escola.endereco,
                  addressLocality: cidade,
                  addressRegion: estado.uf,
                  addressCountry: "BR",
                },
              }
            : {}),
          // O site próprio da unidade, quando existe, amarra as duas fontes
          // como a mesma entidade — é o que os buscadores de IA seguem.
          ...(escola.site ? { sameAs: [escola.site] } : {}),
          parentOrganization: {
            "@type": "EducationalOrganization",
            name: SITE_NOME,
            url: SITE_URL,
          },
        }}
      />
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: estado.nome,
              item: `${SITE_URL}/${estado.slug}`,
            },
            { "@type": "ListItem", position: 3, name: nome, item: url },
          ],
        }}
      />
      <Header />
      <main>
        {/* Capa da escola */}
        <section className="relative overflow-hidden bg-brand-950 pt-24">
          <div className="absolute inset-0">
            {escola.foto ? (
              <Image
                src={`/${escola.foto}`}
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-30 blur-sm"
              />
            ) : (
              <Image
                src="/imagens/campanha/hero-bg.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-20"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-950/40 to-brand-950"
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10">
            <Link
              href={`/${estado.slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {estado.nome}
            </Link>
            <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-gold-400">
                  Matrículas abertas · {estado.associacao}
                </p>
                <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tighter text-white sm:text-5xl lg:text-6xl">
                  {nome}
                </h1>
                {escola.endereco ? (
                  <p className="mt-5 flex max-w-xl items-start gap-2 leading-relaxed text-white/75">
                    <MapPin
                      aria-hidden
                      className="mt-1 size-4 shrink-0 text-gold-400"
                    />
                    {escola.endereco}
                  </p>
                ) : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#matricula"
                    className={cn(
                      buttonVariants(),
                      "h-12 rounded-full bg-gold-400 px-7 text-base font-extrabold text-brand-950 shadow-cta hover:bg-gold-500",
                    )}
                  >
                    Quero matricular
                  </a>
                  {whatsapp ? (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-12 rounded-full border-2 border-white/30 bg-transparent px-7 text-base font-bold text-white hover:bg-white/10",
                      )}
                    >
                      <MessageCircle aria-hidden className="size-4" />
                      Falar no WhatsApp
                    </a>
                  ) : null}
                  {linkMaps ? (
                    <a
                      href={linkMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-12 rounded-full border-2 border-white/30 bg-transparent px-7 text-base font-bold text-white hover:bg-white/10",
                      )}
                    >
                      <Navigation aria-hidden className="size-4" />
                      Como chegar
                    </a>
                  ) : null}
                </div>
              </div>
              {escola.foto ? (
                <Reveal>
                  <div className="overflow-hidden rounded-3xl shadow-card-hover">
                    <Image
                      src={`/${escola.foto}`}
                      alt={`Fachada: ${nome}`}
                      width={1200}
                      height={800}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>

        {/* Sobre a escola: conteúdo indexável */}
        <section className="mx-auto max-w-7xl px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tighter text-brand-900 sm:text-4xl">
                Uma escola cristã de verdade em {cidade}
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
                <p>
                  O {nome} faz parte da Rede de Educação Adventista, presente no
                  Brasil há 130 anos e no mundo com mais de 2 milhões de alunos
                  em 9 mil escolas. Aqui em {cidade}, isso significa ensino
                  forte, tecnologia em sala e uma formação baseada em valores
                  que acompanham seu filho para a vida toda.
                </p>
                <p>
                  A proposta pedagógica une conhecimento acadêmico e
                  desenvolvimento físico, emocional e espiritual, da Educação
                  Infantil ao Ensino Médio, com material didático próprio da
                  rede e professores que conhecem cada aluno pelo nome.
                </p>
                <p>
                  A matrícula para 2027 está aberta: preencha o formulário ou
                  chame a equipe no WhatsApp para agendar uma visita e conhecer
                  a estrutura de perto.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-line bg-surface p-8 shadow-card">
                <h3 className="text-lg font-extrabold tracking-tight text-brand-900">
                  Por que as famílias escolhem
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {rede.diferenciais.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <CheckCircle2
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-gold-600"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
                {escola.telefone ? (
                  <p className="mt-6 border-t border-line pt-5 text-sm text-muted-foreground">
                    Telefone:{" "}
                    <a
                      href={`tel:${escola.telefone.replace(/\D/g, "")}`}
                      className="font-bold text-brand-800 hover:underline"
                    >
                      {escola.telefone}
                    </a>
                  </p>
                ) : null}
              </div>
            </Reveal>
          </div>
        </section>

        <DepoimentosSection />

        {/* AEO: as perguntas da unidade, visíveis e marcadas em FAQPage */}
        <FaqBloco
          perguntas={perguntasEscola(escola, estado)}
          titulo={`Dúvidas sobre ${nome}`}
          chamada="O que as famílias mais perguntam antes de conhecer a unidade."
        />

        {/* Formulário (finale) */}
        <section
          id="matricula"
          className="relative scroll-mt-10 overflow-hidden bg-paper"
        >
          <div className="absolute inset-0">
            <Image
              src="/imagens/iabc/vida-estudo.jpg"
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
                Garanta sua vaga no {nome}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
                Deixe seu contato e a equipe da unidade fala com você pelo
                WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={0.12} className="mt-10">
              <LeadForm
                estados={getFormEstados()}
                estadoInicial={estado.slug}
                escolaInicial={nome}
              />
            </Reveal>
          </div>
        </section>
      </main>
      <WhatsFlutuante
        linkDireto={whatsapp}
        regioes={regioes.map((e) => ({
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
