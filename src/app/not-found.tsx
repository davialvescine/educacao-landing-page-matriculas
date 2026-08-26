import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand-950 px-4 text-center">
      <Image
        src="/imagens/campanha/hero-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-15"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-950/50 to-brand-950"
      />
      <div className="relative">
        <Image
          src="/imagens/logos/logo_colegio.png"
          alt="Educação Adventista Centro-Oeste"
          width={502}
          height={150}
          className="mx-auto h-12 w-auto"
        />
        <p
          aria-hidden
          className="mt-10 text-8xl font-extrabold tracking-tighter text-transparent [-webkit-text-stroke:3px_rgba(248,192,56,0.8)] sm:text-9xl"
        >
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tighter text-white sm:text-4xl">
          Essa página não existe
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Mas a escola certa para o seu filho existe, e está pertinho de você.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants(),
              "h-12 rounded-full bg-gold-400 px-7 text-base font-extrabold text-brand-950 shadow-cta hover:bg-gold-500",
            )}
          >
            Ir para o início
          </Link>
          <Link
            href="/#regioes"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 rounded-full border-2 border-white/30 bg-transparent px-7 text-base font-bold text-white hover:bg-white/10",
            )}
          >
            Encontrar uma escola
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
