import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { nomeEscola, slugEscola, type Escola, type Estado } from "@/lib/rede";

export default function UnidadeCard({
  escola,
  estado,
}: {
  escola: Escola;
  estado: Estado;
}) {
  const nome = nomeEscola(escola);
  const temWhats = Boolean(estado.whatsapp.link);
  const href = `/${estado.slug}/${slugEscola(escola)}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-400/60 hover:shadow-card-hover">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-brand-900">
        {escola.foto ? (
          <Image
            src={`/${escola.foto}`}
            alt={`Fachada: ${nome}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <>
            <Image
              src="/imagens/campanha/hero-bg.jpg"
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover opacity-50"
            />
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold tracking-tighter text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.45)]"
            >
              {estado.uf}
            </span>
          </>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/15 to-transparent"
        />
        <h3 className="absolute inset-x-5 bottom-4 text-lg font-extrabold leading-snug tracking-tight text-white">
          {nome}
        </h3>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        {escola.endereco && (
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-500" />
            {escola.endereco}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
          {temWhats && (
            <a
              href={estado.whatsapp.link!}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants(),
                "h-11 flex-1 rounded-full text-sm font-bold",
              )}
            >
              <MessageCircle aria-hidden className="size-4" />
              WhatsApp
            </a>
          )}
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 flex-1 rounded-full border-2 border-brand-200 bg-transparent text-sm font-bold text-brand-800 hover:border-brand-400 hover:bg-brand-50",
            )}
          >
            Conhecer
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
