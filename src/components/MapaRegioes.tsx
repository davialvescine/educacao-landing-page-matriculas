import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { MAPA_PATHS, MAPA_VIEWBOX } from "@/data/mapa-paths";
import { getEstados } from "@/lib/rede";

const OURO = "#f2b541";

/** Pinos sobre o mapa (coordenadas no viewBox 1735×2048 do mapa oficial). */
const PINS: {
  slug: string;
  rotulo: string;
  x: number;
  y: number;
  delay: string;
  largura: number;
}[] = [
  { slug: "oeste-mt", rotulo: "MT Oeste", x: 950, y: 640, delay: "0s", largura: 176 },
  { slug: "leste-mt", rotulo: "MT Leste", x: 470, y: 950, delay: "0.4s", largura: 172 },
  { slug: "tocantins", rotulo: "Tocantins", x: 1390, y: 380, delay: "0.8s", largura: 184 },
  { slug: "goias", rotulo: "Goiás", x: 1250, y: 1260, delay: "1.2s", largura: 130 },
  { slug: "distrito-federal", rotulo: "DF", x: 1620, y: 990, delay: "1.6s", largura: 88 },
  { slug: "mato-grosso-do-sul", rotulo: "MS", x: 750, y: 1660, delay: "2s", largura: 92 },
];

/** Estados cuja forma inteira é clicável (MT navega pelos dois pinos). */
const FORMAS_CLICAVEIS: Record<string, string> = {
  to: "tocantins",
  go: "goias",
  df: "distrito-federal",
  ms: "mato-grosso-do-sul",
};

function Forma({ chave }: { chave: string }) {
  const raso = chave === "df";
  return (
    <g className="mapa-estado">
      {!raso && MAPA_PATHS[chave].map((d, i) => (
        <path key={`base-${i}`} d={d} fill="#6e4c0f" transform="translate(0,28)" />
      ))}
      {!raso && (
        <g className="estado-meio">
          {MAPA_PATHS[chave].map((d, i) => (
            <path key={`meio-${i}`} d={d} fill="#c28a1a" />
          ))}
        </g>
      )}
      <g className="estado-topo">
        {MAPA_PATHS[chave].map((d, i) => (
          <path key={`topo-${i}`} d={d} fill="url(#ouro-mapa)" />
        ))}
      </g>
    </g>
  );
}

function Pin({ pin }: { pin: (typeof PINS)[number] }) {
  const contagem = getEstados().find((e) => e.slug === pin.slug)?.escolas.length ?? 0;
  const rotulo = `${pin.rotulo} · ${contagem}`;
  const largura = rotulo.length * 21 + 56;
  return (
    <Link href={`/${pin.slug}`} aria-label={`${pin.rotulo} — ${contagem} unidades`}>
      <g className="mapa-pin" style={{ cursor: "pointer" }}>
        <circle className="pin-pulso" cx={pin.x} cy={pin.y} r="34" fill="#f8c038" style={{ "--delay": pin.delay } as React.CSSProperties} />
        {/* gota do pin */}
        <g transform={`translate(${pin.x}, ${pin.y})`}>
          <path
            d="M0,0 C-11,-20 -24,-28 -24,-46 a24,24 0 1,1 48,0 C24,-28 11,-20 0,0 Z"
            transform="scale(1.5)"
            fill="#f8c038"
            stroke="#050c42"
            strokeWidth="5"
          />
          <circle cx="0" cy="-69" r="15" fill="#050c42" />
        </g>
        {/* pill com nome e contagem */}
        <rect x={pin.x - largura / 2} y={pin.y + 22} rx="34" width={largura} height="68" fill="#050c42" opacity="0.94" stroke="rgba(248,192,56,0.5)" strokeWidth="2" />
        <text x={pin.x} y={pin.y + 68} textAnchor="middle" fontSize="38" fontWeight="800" fill="#ffffff" fontFamily="inherit">
          {rotulo}
        </text>
      </g>
    </Link>
  );
}

/** Seção do seletor de regiões: mapa oficial vetorizado + lista sincronizada. */
export default function MapaRegioes() {
  const estados = getEstados();
  const totalEscolas = estados.reduce((n, e) => n + e.escolas.length, 0);

  return (
    <section
      id="regioes"
      className="relative scroll-mt-10 overflow-hidden bg-brand-950"
    >
      {/* Cerrado ao fundo (ipê-amarelo, chapadas) com véu azul */}
      <Image
        src="/imagens/campanha/fundo-cerrado-2.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-brand-950/95 via-brand-950/30 to-brand-950/95"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-28">
        <Reveal>
          <p className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-gold-400">
            <span aria-hidden>✦</span> 6 regiões, {totalEscolas} escolas{" "}
            <span aria-hidden>✦</span>
          </p>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-primary-foreground sm:text-5xl">
            Toque no mapa e encontre
            <br className="hidden sm:block" /> uma escola perto de você
          </h2>
        </Reveal>
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-12">
          <Reveal delay={0.1} className="lg:col-span-7">
            <svg
              viewBox={MAPA_VIEWBOX}
              role="img"
              aria-label="Mapa do Centro-Oeste com as regiões da Educação Adventista"
              className="mx-auto w-full max-w-[620px] font-sans drop-shadow-[0_28px_48px_rgba(0,0,0,0.45)]"
            >
              <defs>
                <linearGradient id="ouro-mapa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f9dd6b" />
                  <stop offset="0.55" stopColor="#f2b541" />
                  <stop offset="1" stopColor="#dd9a22" />
                </linearGradient>
              </defs>
              <Forma chave="mt" />
              <Link href="/tocantins" aria-label="Tocantins">
                <g style={{ cursor: "pointer" }}>
                  <Forma chave="to" />
                </g>
              </Link>
              <Link href="/goias" aria-label="Goiás">
                <g style={{ cursor: "pointer" }}>
                  <Forma chave="go" />
                </g>
              </Link>
              <Link href="/distrito-federal" aria-label="Distrito Federal">
                <g style={{ cursor: "pointer" }}>
                  <Forma chave="df" />
                </g>
              </Link>
              <Link href="/mato-grosso-do-sul" aria-label="Mato Grosso do Sul">
                <g style={{ cursor: "pointer" }}>
                  <Forma chave="ms" />
                </g>
              </Link>
              {PINS.map((p) => (
                <Pin key={p.slug} pin={p} />
              ))}
            </svg>
          </Reveal>
          <Reveal delay={0.2} className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-brand-900/50 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <p className="border-b border-white/10 px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-gold-400">
                Escolha a sua região
              </p>
              <div className="flex flex-col divide-y divide-white/10">
              {estados.map((e) => (
                <Link
                  key={e.slug}
                  href={`/${e.slug}`}
                  className="group flex items-center gap-4 px-6 py-[1.15rem] transition-colors hover:bg-white/5"
                >
                  <span className="text-xs font-extrabold uppercase tracking-widest text-gold-400 w-14">
                    {e.associacao}
                  </span>
                  <span className="flex-grow text-lg font-extrabold tracking-tight text-primary-foreground">
                    {e.nome}
                  </span>
                  <span className="text-sm font-semibold text-primary-foreground/60">
                    {e.escolas.length} unidades
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-4 text-gold-400 transition-transform group-hover:translate-x-1.5"
                  />
                </Link>
              ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
