import Image from "next/image";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "@/components/Secoes";

const CENAS = [
  { src: "/imagens/campanha/escola-robotica.jpg", legenda: "Robótica e cultura maker" },
  { src: "/imagens/campanha/escola-ciencias.jpg", legenda: "Ciência na prática" },
  { src: "/imagens/campanha/escola-esporte.jpg", legenda: "Esporte e amizade" },
  { src: "/imagens/campanha/escola-musica.jpg", legenda: "Música e artes" },
];

/** Um dia na escola: galeria de experiências. */
export default function UmDiaSection() {
  return (
    <section id="um-dia" className="relative scroll-mt-10 overflow-hidden bg-surface [background-image:radial-gradient(ellipse_600px_320px_at_50%_0%,rgba(248,192,56,0.18),transparent_70%)]">
      <div className="mx-auto max-w-7xl px-4 py-28">
        <Reveal>
          <Eyebrow>Muito além da sala de aula</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            Um dia na escola
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Robótica, ciência, esporte, música e fé, todos os dias, em todas as
            unidades.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CENAS.map((c, i) => (
            <Reveal key={c.src} delay={(i % 4) * 0.08}>
              <figure className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                <Image
                  src={c.src}
                  alt={c.legenda}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 text-lg font-extrabold tracking-tight text-white">
                  {c.legenda}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Imagens ilustrativas da experiência Adventista.
        </p>
      </div>
    </section>
  );
}
