import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import FaqBloco from "@/components/FaqBloco";
import PainelDia, { type MomentoDia } from "@/components/iabc/PainelDia";
import CasaEscola, { type FotoCampus } from "@/components/iabc/CasaEscola";
import HeroIabc, { type QuadroHero } from "@/components/iabc/HeroIabc";
import BarraCtaMobile from "@/components/BarraCtaMobile";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFormEstados, getRede } from "@/lib/rede";
import { perguntasIabc } from "@/lib/faq";
import { linkWhatsapp, SITE_NOME, SITE_URL } from "@/lib/site";

/**
 * Landing do internato.
 *
 * A família do IABC decide outra coisa que a de escola de bairro: ela vai
 * mandar o filho morar longe. Por isso a página não repete a estrutura das
 * páginas de região. Ela responde, na ordem, o que essa família pergunta:
 * como é morar aqui, como é o dia, quanto custa somando moradia, quem
 * cuida do meu filho, e dá para ver antes de decidir.
 *
 * Movimento: só o que a rolagem justifica. A seção do dia é presa e
 * corre na horizontal, porque o dia é uma sequência e a rolagem vira a
 * passagem do tempo. No celular nada é preso, e sob
 * prefers-reduced-motion nada anima.
 */

const FOTOS_DIA: MomentoDia[] = [
  { src: "/imagens/iabc/site/estudo-em-dupla.jpg", titulo: "Estudo", texto: "Aulas e estudo dirigido, com acompanhamento de quem conhece o aluno pelo nome." },
  { src: "/imagens/iabc/site/laboratorio.jpg", titulo: "Laboratório", texto: "Ciência com a mão na massa, não só no quadro." },
  { src: "/imagens/iabc/site/natacao.jpg", titulo: "Natação", texto: "Piscina dentro do campus, sem depender de transporte nem de horário de fora." },
  { src: "/imagens/iabc/site/corrida-na-mata.jpg", titulo: "Esporte", texto: "Treino ao ar livre num campus onde dá para correr sem sair do portão." },
  { src: "/imagens/iabc/site/piano.jpg", titulo: "Música", texto: "Piano, coral e instrumentos abertos a quem nunca tocou nada antes." },
  { src: "/imagens/iabc/site/apresentacao.jpg", titulo: "Palco", texto: "Apresentar em público desde cedo, que é o que solta a voz de qualquer um." },
  { src: "/imagens/iabc/site/convivencia-entardecer.jpg", titulo: "Convivência", texto: "Amizades que nascem de dividir o dia inteiro, e não só a sala de aula." },
];

/** A capa se reveza: nenhuma foto sozinha mostra o que é morar aqui. */
const QUADROS_HERO: QuadroHero[] = [
  { src: "/imagens/iabc/site/convivencia-entardecer.jpg", alt: "Fim de tarde no campus" },
  { src: "/imagens/iabc/site/alunos-no-campus.jpg", alt: "Alunos do Ensino Médio" },
  { src: "/imagens/iabc/campus-aereo.jpg", alt: "O campus visto de cima" },
  { src: "/imagens/iabc/site/corrida-na-mata.jpg", alt: "Treino na mata do campus" },
];

/** O campus por dentro, no carrossel da seção de abertura. */
const FOTOS_CAMPUS: FotoCampus[] = [
  { src: "/imagens/iabc/campus-dormitorio.jpg", alt: "Dormitório" },
  { src: "/imagens/iabc/site/alunos-no-campus.jpg", alt: "Alunos no campus" },
  { src: "/imagens/iabc/site/academia.jpg", alt: "Academia" },
  { src: "/imagens/iabc/site/grupo-ao-ar-livre.jpg", alt: "Área externa" },
  { src: "/imagens/iabc/campus-aereo.jpg", alt: "Vista do campus" },
];

export const metadata: Metadata = {
  title: "IABC: Internato Adventista em Goiás, Matrículas 2027",
  description:
    "Internato adventista em Abadiânia (GO): escola e moradia no mesmo campus, da Educação Infantil ao Ensino Médio. Agende uma visita e conheça antes de decidir.",
  keywords: [
    "internato adventista",
    "colégio interno Goiás",
    "IABC",
    "Instituto Adventista Brasil Central",
    "internato para adolescentes",
    "escola em regime de internato",
  ],
  alternates: { canonical: `${SITE_URL}/iabc` },
  openGraph: {
    title: "IABC: o internato da Educação Adventista no Centro-Oeste",
    description:
      "Escola e moradia no mesmo campus, em Abadiânia (GO). Agende uma visita.",
  },
};

export default function IabcPage() {
  const { iabc } = getRede();
  const whatsapp = linkWhatsapp(iabc.whatsapp ?? iabc.telefone);
  const perguntas = perguntasIabc(iabc);

  return (
    <>
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "School",
          "@id": `${SITE_URL}/iabc#escola`,
          name: iabc.nome,
          url: `${SITE_URL}/iabc`,
          description:
            "Internato adventista em Abadiânia (GO), com escola e moradia no mesmo campus, da Educação Infantil ao Ensino Médio.",
          image: `${SITE_URL}/imagens/iabc/campus-aereo.jpg`,
          ...(iabc.telefone ? { telephone: iabc.telefone } : {}),
          ...(iabc.endereco
            ? {
                address: {
                  "@type": "PostalAddress",
                  streetAddress: iabc.endereco,
                  addressLocality: "Abadiânia",
                  addressRegion: "GO",
                  addressCountry: "BR",
                },
              }
            : {}),
          ...(iabc.site ? { sameAs: [iabc.site] } : {}),
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
              name: "IABC",
              item: `${SITE_URL}/iabc`,
            },
          ],
        }}
      />

      <Header />
      <main>
        {/* Capa editorial: a foto dá o clima, o texto entrega a frase */}
        <HeroIabc quadros={QUADROS_HERO}>
          <p className="hero-entra text-xs font-extrabold uppercase tracking-[0.24em] text-gold-300">
            Internato · Abadiânia, Goiás
          </p>
          <h1 className="hero-titulo mt-6 max-w-4xl text-[2.6rem] font-extrabold leading-[0.98] tracking-tighter text-white sm:text-7xl lg:text-8xl [&_.hero-linha]:overflow-hidden [&_.hero-linha]:pb-[0.08em]">
            Aqui ele não vai
            <br />
            só estudar. Vai{" "}
            <span className="text-gold-300">viver</span>.
          </h1>
          <p className="hero-entra mt-7 max-w-lg text-lg leading-relaxed text-white/80">
            Escola, moradia e esporte no mesmo campus, com gente cuidando dele o
            dia inteiro.
          </p>
          <div className="hero-entra mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#visita"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 rounded-full bg-gold-400 px-8 text-base font-bold text-brand-950 shadow-cta transition-transform hover:bg-gold-300 active:translate-y-px",
              )}
            >
              Quero conhecer o campus
            </a>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-14 rounded-full border-2 border-white/35 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-sm hover:bg-white/15 active:translate-y-px",
                )}
              >
                <MessageCircle aria-hidden className="size-5" />
                Falar com a equipe
              </a>
            )}
          </div>
        </HeroIabc>

        <CasaEscola fotos={FOTOS_CAMPUS} />

        <PainelDia momentos={FOTOS_DIA} />

        {/* Custo: a pergunta que a família faz primeiro e ninguém responde */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:py-32">
            <Reveal>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold-600">
                O que entra no valor
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tighter text-brand-950 sm:text-5xl">
                Estudar e morar entram na mesma conta
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-card border border-gold-200 bg-gold-100/50 p-8">
                  <p className="text-lg font-extrabold tracking-tight text-brand-950">
                    Mensalidade escolar
                  </p>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    A parte de ensino, com material didático próprio da rede,
                    professores e as atividades que fazem parte do currículo.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="h-full rounded-card bg-gold-400 p-8">
                  <p className="text-lg font-extrabold tracking-tight text-brand-950">
                    Moradia no campus
                  </p>
                  <p className="mt-3 leading-relaxed text-brand-950/80">
                    Dormitório, alimentação e o acompanhamento de quem fica com
                    os alunos fora do horário de aula.
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.16}>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Os valores mudam por série e por ano letivo, então não publicamos
                uma tabela que envelhece. Peça contato nesta página e a equipe
                envia os números vigentes, as formas de pagamento e as condições
                de matrícula, sem compromisso.
              </p>
            </Reveal>
          </div>
        </section>

        {/* O medo real do pai, dito com todas as letras */}
        <section className="relative isolate overflow-hidden bg-gold-400">
          <Image
            src="/imagens/iabc/site/acolhimento-em-sala.jpg"
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover object-center opacity-25"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-gold-400 via-gold-400/85 to-gold-400/55"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-28">
            <Reveal>
              <p className="text-2xl font-extrabold leading-snug tracking-tighter text-brand-950 sm:text-4xl">
                A pergunta que ninguém faz em voz alta é quem cuida do meu filho
                quando eu não estou.
              </p>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-brand-950/75">
                No internato existe uma equipe responsável pelos alunos fora da
                sala de aula, com rotina definida, horários e acompanhamento
                diário. Antes de matricular, a família conhece essas pessoas
                pessoalmente. É o que a visita serve para responder.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="relative aspect-4/5 overflow-hidden rounded-card shadow-foto lg:aspect-3/4">
                <Image
                  src="/imagens/iabc/site/acolhimento-em-sala.jpg"
                  alt="Professora acolhendo um aluno em sala"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Visita: o convite, com o campus de volta na foto */}
        <section id="visita" className="scroll-mt-10 bg-paper">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-32">
            <Reveal>
              <div className="relative aspect-4/3 overflow-hidden rounded-card shadow-foto">
                <Image
                  src="/imagens/iabc/site/amizade.jpg"
                  alt="Alunos do IABC no campus"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tighter text-brand-950 sm:text-5xl">
                Venha ver antes
                <br />
                de decidir
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Nenhuma foto substitui andar pelo dormitório, sentar na sala e
                conversar com quem passa o dia com os alunos. A visita é
                marcada no horário que der para a sua família.
              </p>
              <ul className="mt-9 flex flex-col gap-4">
                {iabc.endereco && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-600" />
                    <span>{iabc.endereco}</span>
                  </li>
                )}
                {iabc.telefone && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-600" />
                    <span>{iabc.telefone}</span>
                  </li>
                )}
              </ul>
              <a
                href="#matricula"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-9 h-14 rounded-full px-8 text-base font-bold shadow-cta active:translate-y-px",
                )}
              >
                Agendar minha visita
              </a>
            </Reveal>
          </div>
        </section>

        <FaqBloco
          perguntas={perguntas}
          titulo="O que as famílias perguntam sobre o internato"
          chamada="Respostas diretas. O que depende da série ou do ano letivo, a equipe confirma no contato."
        />

        {/* Formulário */}
        <section
          id="matricula"
          className="relative scroll-mt-10 overflow-hidden bg-brand-950"
        >
          <Image
            src="/imagens/iabc/campus-aereo.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-20"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-brand-950 via-brand-950/85 to-brand-950"
          />
          <div className="relative mx-auto max-w-2xl px-4 py-28 sm:px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-extrabold leading-tight tracking-tighter text-white sm:text-5xl">
                Comece a conversa
              </h2>
              <p className="mx-auto mt-4 max-w-md text-center leading-relaxed text-white/70">
                Deixe seu contato e a equipe do internato fala com você pelo
                WhatsApp para agendar a visita.
              </p>
            </Reveal>
            <Reveal delay={0.12} className="mt-10">
              {/* Só o IABC: quem está nesta página já escolheu a unidade. */}
              <LeadForm
                estados={getFormEstados().filter((e) => e.slug === "iabc")}
                estadoInicial="iabc"
                escolaInicial={iabc.nome}
                regiaoFixa
              />
            </Reveal>
          </div>
        </section>
      </main>
      <BarraCtaMobile />
      <Footer />
    </>
  );
}
