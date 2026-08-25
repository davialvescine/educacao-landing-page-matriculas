import Image from "next/image";
import Link from "next/link";
import FotoRotativa, { type FotoAluno } from "@/components/FotoRotativa";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  /** Foto recortada do aluno (caminho em /public). */
  foto?: string;
  fotoLargura?: number;
  fotoAltura?: number;
  /** Várias fotos: rotação ambiente com crossfade (ignora `foto`). */
  fotos?: FotoAluno[];
  /** Bloco central direito (lettering/título + CTAs), como na arte oficial. */
  children: React.ReactNode;
}

/**
 * Super hero fiel à arte oficial da campanha 2027:
 * aluno grande à esquerda · à direita a pilha vertical com
 * logo + selo 130 anos, lettering, CTAs e a linha
 * #MuitoAlémdoEnsino · educacaoadventista.org.br na base.
 */
export default function Hero({
  foto = "/imagens/campanha/amanda.webp",
  fotoLargura = 1435,
  fotoAltura = 2200,
  fotos,
  children,
}: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-gold-400">
      {/* Fundo: mosaico oficial estático */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/imagens/campanha/hero-bg.jpg"
          alt=""
          fill
          priority
          decoding="sync"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Brilho pulsante */}
      <div className="absolute -left-32 top-1/4 -z-10 opacity-80">
        <Image
          src="/imagens/campanha/brilho.webp"
          alt=""
          width={900}
          height={790}
          className="w-[42rem] max-w-none"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-20">
        <div className="grid items-end gap-x-8 lg:min-h-[600px] lg:grid-cols-12 xl:min-h-[660px]">

          {/* Direita: pilha vertical central */}
          <div className="flex flex-col items-start gap-7 py-12 sm:py-14 lg:col-span-7 lg:items-center lg:self-center lg:py-24 lg:text-center">
            {/* Logo + selo 130 anos */}
            <div
              className="hero-enter flex flex-wrap items-center gap-x-7 gap-y-3 lg:justify-center"
              style={{ "--delay": "0.05s" } as React.CSSProperties}
            >
              <Image
                src="/imagens/campanha/logo-ea.png"
                alt="Educação Adventista"
                width={3427}
                height={713}
                priority
                className="h-11 w-auto xl:h-12"
              />
              <Image
                src="/imagens/campanha/selo-130-anos.png"
                alt="130 anos, de 1896 a 2026"
                width={1142}
                height={369}
                className="h-9 w-auto xl:h-10"
              />
            </div>

            {children}

            {/* Linha da base: hashtag */}
            <div
              className="hero-enter lg:self-center"
              style={{ "--delay": "0.55s" } as React.CSSProperties}
            >
              <Image
                src="/imagens/campanha/muito-alem-do-ensino.png"
                alt="#MuitoAlémdoEnsino"
                width={1617}
                height={122}
                className="h-4 w-auto"
              />
            </div>
          </div>

          {/* Esquerda: aluno ancorado na base, como na arte */}
          <div className="relative flex items-end justify-center lg:order-first lg:col-span-5">
            {fotos && fotos.length > 1 ? (
              <div
                className="hero-enter w-full"
                style={{ "--delay": "0.2s" } as React.CSSProperties}
              >
                <FotoRotativa fotos={fotos} />
              </div>
            ) : (
              <Image
                src={foto}
                alt="Estudante da Educação Adventista"
                width={fotoLargura}
                height={fotoAltura}
                priority
                decoding="sync"
                className="hero-enter relative z-10 w-auto max-h-[440px] sm:max-h-[520px] lg:max-h-[620px] xl:max-h-[680px]"
                style={{ "--delay": "0.2s" } as React.CSSProperties}
              />
            )}
            <HeroChip classe="left-0 top-[24%]" delay="0s" valor="39" rotulo="escolas" />
            <HeroChip classe="-right-2 top-[40%]" delay="1.4s" valor="6" rotulo="regiões" />
            <HeroChip classe="left-2 bottom-[14%]" delay="2.4s" valor="1896" rotulo="desde" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Chip glass flutuante com micro-estatística, ao redor da foto do hero. */
function HeroChip({
  classe,
  delay,
  valor,
  rotulo,
}: {
  classe: string;
  delay: string;
  valor: string;
  rotulo: string;
}) {
  return (
    <div
      className={cn(
        "anim-chip absolute z-20 hidden rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 text-center shadow-card lg:block",
        classe,
      )}
      style={{ "--delay": delay } as React.CSSProperties}
    >
      <p className="text-xl font-extrabold leading-none tracking-tight text-brand-800">
        {valor}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brand-950/60">
        {rotulo}
      </p>
    </div>
  );
}

const CTA_SECUNDARIO = cn(
  buttonVariants({ size: "lg", variant: "outline" }),
  "h-14 rounded-full border-[3px] border-primary bg-transparent px-8 text-base font-bold text-brand-800 hover:bg-primary hover:text-primary-foreground",
);

export function HeroCtas({ whatsapp }: { whatsapp?: string | null }) {
  return (
    <div
      className="hero-enter flex flex-wrap gap-4 lg:justify-center"
      style={{ "--delay": "0.4s" } as React.CSSProperties}
    >
      <Link
        href="#matricula"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-14 rounded-full px-8 text-base font-bold shadow-cta",
        )}
      >
        Quero garantir minha vaga
      </Link>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={CTA_SECUNDARIO}
        >
          Falar no WhatsApp
        </a>
      ) : (
        <Link href="#regioes" className={CTA_SECUNDARIO}>
          Encontrar uma escola
        </Link>
      )}
    </div>
  );
}
