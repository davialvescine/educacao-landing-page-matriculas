import type { Metadata } from "next";
import Image from "next/image";
import {
  BedDouble,
  Check,
  GraduationCap,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
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
  { src: "/imagens/iabc/site/estudo-em-dupla.jpg", hora: "07h30", titulo: "Estudo", texto: "Aulas e estudo dirigido, com acompanhamento de quem conhece o aluno pelo nome." },
  { src: "/imagens/iabc/site/laboratorio.jpg", hora: "10h", titulo: "Laboratório", texto: "Ciência com a mão na massa, não só no quadro." },
  { src: "/imagens/iabc/site/natacao.jpg", hora: "14h", titulo: "Natação", texto: "Piscina dentro do campus, sem depender de transporte nem de horário de fora." },
  { src: "/imagens/iabc/site/corrida-na-mata.jpg", hora: "16h", titulo: "Esporte", texto: "Treino ao ar livre num campus onde dá para correr sem sair do portão." },
  { src: "/imagens/iabc/site/piano.jpg", hora: "17h30", titulo: "Música", texto: "Piano, coral e instrumentos abertos a quem nunca tocou nada antes." },
  { src: "/imagens/iabc/site/apresentacao.jpg", hora: "19h", titulo: "Palco", texto: "Apresentar em público desde cedo, que é o que solta a voz de qualquer um." },
  { src: "/imagens/iabc/site/convivencia-entardecer.jpg", hora: "21h", titulo: "Convivência", texto: "Amizades que nascem de dividir o dia inteiro, e não só a sala de aula." },
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
          <h1 className="hero-titulo mt-6 max-w-4xl text-[2.6rem] font-extrabold leading-[0.98] tracking-tighter text-white sm:text-7xl lg:text-8xl">
            {/* Cada linha em dois blocos: o de fora recorta, o de dentro
                sobe. É o que deixa a linha "nascer" de baixo sem o título
                perder a altura dele. */}
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-linha block">Aqui ele não vai</span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-linha block">
                só estudar. Vai <span className="text-gold-300">viver</span>.
              </span>
            </span>
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
        <section className="relative overflow-hidden bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
              {/* Duas fotos em cascata: a casa e a sala, que é exatamente o
                  que a mensalidade cobre. Sem foto, "moradia" é palavra;
                  com a foto do dormitório, é um lugar. */}
              <Reveal className="relative">
                <div className="relative aspect-4/5 overflow-hidden rounded-card shadow-foto">
                  <Image
                    src="/imagens/iabc/campus-dormitorio.jpg"
                    alt="Dormitório do IABC"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="anim-zoom-lento object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-950">
                    Dormitório
                  </span>
                </div>
                <div className="absolute -bottom-8 -right-4 hidden w-[46%] overflow-hidden rounded-card border-4 border-surface shadow-foto sm:block lg:-right-10">
                  <div className="relative aspect-4/3">
                    <Image
                      src="/imagens/iabc/site/estudo-em-dupla.jpg"
                      alt="Alunos estudando"
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-950">
                    Sala de aula
                  </span>
                </div>
              </Reveal>

              <div>
                <Reveal>
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold-600">
                    O que entra no valor
                  </p>
                  <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tighter text-brand-950 sm:text-5xl">
                    Uma mensalidade.
                    <br />
                    <span className="text-gold-600">Escola, casa e mesa</span> juntas.
                  </h2>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                    No internato não existe "e mais isso": a conta que a família
                    faz em casa já vem com o que o filho vai usar o dia inteiro.
                  </p>
                </Reveal>

                <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                  {[
                    { Icone: GraduationCap, titulo: "Ensino", texto: "Aulas, material didático próprio da rede e as atividades do currículo." },
                    { Icone: BedDouble, titulo: "Moradia", texto: "Dormitório no campus, com a rotina e o acompanhamento de quem fica com os alunos." },
                    { Icone: UtensilsCrossed, titulo: "Alimentação", texto: "As refeições do dia, no refeitório do próprio campus." },
                    { Icone: HeartHandshake, titulo: "Acompanhamento", texto: "Equipe responsável pelos alunos fora do horário de aula." },
                  ].map(({ Icone, titulo, texto }, i) => (
                    <Reveal key={titulo} delay={0.06 * i}>
                      <div className="flex h-full gap-4 rounded-2xl border border-gold-200 bg-gold-100/40 p-5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-brand-950">
                          <Icone aria-hidden className="size-5" />
                        </span>
                        <div>
                          <p className="font-extrabold tracking-tight text-brand-950">{titulo}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{texto}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </ul>

                <Reveal delay={0.2}>
                  <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-brand-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-sm leading-relaxed text-white/80">
                      Os valores mudam por série e por ano letivo, por isso não
                      publicamos tabela que envelhece.{" "}
                      <strong className="text-white">
                        Peça e a equipe manda os números vigentes
                      </strong>
                      , com formas de pagamento e condições, sem compromisso.
                    </p>
                    <a
                      href="#matricula"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-12 shrink-0 rounded-full bg-gold-400 px-6 font-bold text-brand-950 hover:bg-gold-300",
                      )}
                    >
                      Quero os valores
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* O medo real do pai, dito com todas as letras */}
        <section className="relative isolate overflow-hidden bg-gold-400">
          <Image
            src="/imagens/iabc/site/acolhimento-em-sala.jpg"
            alt=""
            fill
            sizes="100vw"
            className="anim-zoom-lento -z-10 object-cover object-center opacity-20"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-gold-400 via-gold-400/90 to-gold-400/60"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-32">
            <Reveal>
              {/* A pergunta como citação: aspas grandes e a frase inteira em
                  destaque. É a fala da mãe, não um subtítulo. */}
              <span aria-hidden className="block font-serif text-8xl leading-none text-brand-950/25">
                “
              </span>
              <p className="-mt-6 text-3xl font-extrabold leading-[1.1] tracking-tighter text-brand-950 sm:text-5xl">
                Quem cuida do meu filho quando eu não estou?
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-950/80">
                É a pergunta que ninguém faz em voz alta, e é a que mais importa.
                No internato existe uma equipe responsável pelos alunos fora da
                sala de aula. Antes de matricular, a família conhece essas
                pessoas pessoalmente. A visita serve para isso.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {[
                  "Equipe responsável fora da sala",
                  "Rotina definida, com horários",
                  "Acompanhamento diário",
                  "Você conhece quem cuida, antes",
                ].map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-950/15 bg-white/60 px-4 py-2 text-sm font-bold text-brand-950 backdrop-blur-sm"
                  >
                    <Check aria-hidden className="size-4 text-gold-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="relative">
                <div className="relative aspect-4/5 overflow-hidden rounded-card shadow-foto lg:aspect-3/4">
                  <Image
                    src="/imagens/iabc/site/acolhimento-em-sala.jpg"
                    alt="Professora abraçando uma aluna em sala"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="anim-kenburns object-cover"
                  />
                </div>
                {/* Selo flutuando fora da foto: quebra o retângulo e dá
                    profundidade. */}
                <div className="anim-flutuar absolute -left-4 bottom-8 rounded-2xl bg-brand-950 px-5 py-4 text-white shadow-foto sm:-left-8">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-gold-300">
                    No campus
                  </p>
                  <p className="mt-1 text-lg font-extrabold leading-tight tracking-tight">
                    Gente por perto
                    <br />
                    o dia inteiro
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Visita: o convite, com o campus de volta na foto */}
        <section id="visita" className="scroll-mt-10 bg-paper">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-32">
            <Reveal className="relative">
              <div className="relative aspect-4/3 overflow-hidden rounded-card shadow-foto">
                <Image
                  src="/imagens/iabc/site/amizade.jpg"
                  alt="Alunos do IABC no campus"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="anim-kenburns object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-3 hidden w-[42%] overflow-hidden rounded-card border-4 border-paper shadow-foto sm:block lg:-right-8">
                <div className="relative aspect-4/3">
                  <Image
                    src="/imagens/iabc/campus-aereo.jpg"
                    alt="O campus visto de cima"
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold-600">
                Agende uma visita
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tighter text-brand-950 sm:text-5xl">
                Venha ver antes
                <br />
                de <span className="text-gold-600">decidir</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Nenhuma foto substitui andar pelo dormitório, sentar na sala e
                conversar com quem passa o dia com os alunos. A visita é
                marcada no horário que der para a sua família.
              </p>

              {/* O que acontece na visita, em três passos: tira a incógnita
                  do "e aí, o que eu faço lá?". */}
              <ol className="mt-8 flex flex-col gap-4">
                {[
                  ["Você escolhe o dia", "Pelo WhatsApp ou pelo formulário desta página."],
                  ["Conhece o campus por dentro", "Dormitório, salas, refeitório, quadras e a rotina de verdade."],
                  ["Conversa com quem cuida", "Tira as dúvidas com a equipe que passa o dia com os alunos."],
                ].map(([titulo, texto], i) => (
                  <li key={titulo} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-extrabold text-brand-950">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-extrabold tracking-tight text-brand-950">{titulo}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{texto}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <ul className="mt-8 flex flex-col gap-3 text-muted-foreground">
                {iabc.endereco ? (
                  <li className="flex items-start gap-3">
                    <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-600" />
                    <span>{iabc.endereco}</span>
                  </li>
                ) : null}
                {iabc.telefone ? (
                  <li className="flex items-center gap-3">
                    <Phone aria-hidden className="size-5 shrink-0 text-gold-600" />
                    <span>{iabc.telefone}</span>
                  </li>
                ) : null}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#matricula"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-13 rounded-full px-8 font-bold shadow-cta",
                  )}
                >
                  Agendar minha visita
                </a>
                {iabc.endereco ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(iabc.endereco)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-13 rounded-full border-2 px-6 font-bold",
                    )}
                  >
                    <Navigation aria-hidden className="size-4" />
                    Como chegar
                  </a>
                ) : null}
              </div>
            </Reveal>
          </div>
        </section>

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
