import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRegiaoLead } from "@/lib/rede";

export const metadata: Metadata = {
  title: "Recebemos seu interesse!",
  robots: { index: false },
};

/** Página de conversão pós-lead: ponto de disparo dos pixels de campanha. */
export default async function Obrigado({
  searchParams,
}: {
  searchParams: Promise<{ regiao?: string }>;
}) {
  const { regiao } = await searchParams;
  const estado = regiao ? getRegiaoLead(regiao) : undefined;

  return (
    <>
      <Header />
      <main className="relative isolate overflow-hidden bg-gold-400">
        <Image
          src="/imagens/campanha/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="mx-auto flex min-h-[calc(100vh-1px)] max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
          <span className="hero-pop flex h-24 w-24 items-center justify-center rounded-full bg-brand-700 shadow-cta">
            <CheckCircle2 aria-hidden className="size-12 text-gold-300" />
          </span>
          <h1
            className="hero-enter mt-8 text-4xl font-extrabold leading-[1.05] tracking-tighter text-brand-950 sm:text-6xl"
            style={{ "--delay": "0.15s" } as React.CSSProperties}
          >
            Recebemos o seu
            <br />
            interesse!
          </h1>
          <p
            className="hero-enter mt-6 max-w-xl text-lg font-medium leading-relaxed text-brand-950/80"
            style={{ "--delay": "0.3s" } as React.CSSProperties}
          >
            {estado
              ? `A equipe da ${estado.nome} vai falar com você pelo WhatsApp em instantes.`
              : "Nossa equipe vai falar com você pelo WhatsApp em instantes."}{" "}
            Se preferir, adiante a conversa agora mesmo:
          </p>
          <div
            className="hero-enter mt-9 flex flex-wrap justify-center gap-4"
            style={{ "--delay": "0.45s" } as React.CSSProperties}
          >
            {estado?.whatsapp.link && (
              <a
                href={estado.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-14 rounded-full px-8 text-base font-bold shadow-cta",
                )}
              >
                <MessageCircle aria-hidden className="size-5" />
                Falar agora no WhatsApp
              </a>
            )}
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-14 rounded-full border-[3px] border-brand-700 bg-transparent px-8 text-base font-bold text-brand-800 hover:bg-brand-700 hover:text-primary-foreground",
              )}
            >
              Voltar ao início
            </Link>
          </div>
          <div
            className="hero-enter mt-12 flex items-center gap-6"
            style={{ "--delay": "0.6s" } as React.CSSProperties}
          >
            <Image
              src="/imagens/campanha/selo-130-anos.png"
              alt="130 anos, de 1896 a 2026"
              width={1142}
              height={369}
              className="h-10 w-auto"
            />
            <Image
              src="/imagens/campanha/muito-alem-do-ensino.png"
              alt="#MuitoAlémdoEnsino"
              width={1617}
              height={122}
              className="h-4 w-auto"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
