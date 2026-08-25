import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Reveal from "@/components/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRede } from "@/lib/rede";

export function StatsStrip() {
  const rede = getRede();
  return (
    <section className="bg-brand-950">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-14 text-center sm:grid-cols-3 lg:grid-cols-5">
        {rede.estatisticas.map((s, i) => (
          <Reveal key={s.rotulo} delay={i * 0.07}>
            <p className="text-3xl font-extrabold tracking-tight text-gold-400 sm:text-4xl">
              {s.valor}
            </p>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground/60">
              {s.rotulo}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

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
    "São 39 unidades em 6 regiões — sempre existe uma escola perto de você.",
  "Valores Cristãos que Transformam":
    "Princípios e valores permanentes que acompanham o aluno por toda a vida.",
  "Ambiente Saudável e Inspirador":
    "Estrutura moderna, ambientes acolhedores e tecnologia a serviço do aprender.",
  "Cidadania e Propósito":
    "Formamos cidadãos que fazem a diferença hoje, com excelência e propósito.",
};

export function Diferenciais() {
  const rede = getRede();
  return (
    <section id="diferenciais" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
            Por que escolher a Educação Adventista?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Mais do que preparar para o futuro, formamos pessoas — com valores,
            excelência acadêmica e um projeto de vida com propósito.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {rede.diferenciais.map((d, i) => (
            <Reveal key={d} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-line bg-paper p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-200">
                  <Image
                    src={ICONES_DIFERENCIAIS[i % ICONES_DIFERENCIAIS.length]}
                    alt=""
                    width={56}
                    height={56}
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <h3 className="mt-4 font-bold leading-snug text-brand-900">{d}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {DESCRICOES[d] ?? ""}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-12 text-center">
          <Link
            href="/#matricula"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 rounded-full px-8 text-base font-bold shadow-cta",
            )}
          >
            Quero fazer parte
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function IabcDestaque() {
  const rede = getRede();
  return (
    <section id="iabc" className="scroll-mt-20 bg-brand-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 md:flex-row">
        <Reveal>
          <Image
            src="/imagens/logos/Logo-IABC.png"
            alt="IABC — Instituto Adventista Brasil Central"
            width={220}
            height={120}
            className="h-24 w-auto object-contain"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl">
            Conheça o IABC — nosso internato
          </h2>
          <p className="mt-3 leading-relaxed text-primary-foreground/75">
            O Instituto Adventista Brasil Central reúne educação de excelência e
            estrutura completa de internato, em Abadiânia (GO). Um lugar onde o
            aluno vive, estuda e cresce com propósito.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <a
            href={rede.iabc.site}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-13 shrink-0 rounded-full bg-gold-400 px-7 font-bold text-brand-950 hover:bg-gold-300",
            )}
          >
            Visitar o IABC
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
