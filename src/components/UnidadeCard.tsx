import Image from "next/image";
import { MapPin, MessageCircle, Navigation } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { nomeEscola, type Escola, type Estado } from "@/lib/rede";

export default function UnidadeCard({
  escola,
  estado,
}: {
  escola: Escola;
  estado: Estado;
}) {
  const nome = nomeEscola(escola);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] bg-brand-100">
        {escola.foto ? (
          <Image
            src={`/${escola.foto}`}
            alt={`Fachada: ${nome}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950">
            <span className="text-4xl font-extrabold text-primary-foreground/40">
              {estado.uf}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-bold leading-snug text-brand-900">{nome}</h3>
        {escola.endereco && (
          <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
            {escola.endereco}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {estado.whatsapp.link && (
            <a
              href={estado.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants(),
                "h-10 rounded-full px-5 text-sm font-semibold",
              )}
            >
              <MessageCircle aria-hidden className="size-4" />
              Falar no WhatsApp
            </a>
          )}
          {escola.endereco && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome}, ${escola.endereco}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 rounded-full border-2 border-brand-200 bg-transparent px-5 text-sm font-semibold text-brand-800 hover:border-brand-400 hover:bg-brand-50",
              )}
            >
              <Navigation aria-hidden className="size-4" />
              Como chegar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
