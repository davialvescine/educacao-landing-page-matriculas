import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MapaInterativo from "@/components/MapaInterativo";
import Reveal from "@/components/Reveal";
import { StatsTiles } from "@/components/Secoes";
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
}[] = [
  { slug: "oeste-mt", rotulo: "Oeste Matogrossense", x: 950, y: 640, delay: "0s" },
  { slug: "leste-mt", rotulo: "Leste Matogrossense", x: 470, y: 950, delay: "0.4s" },
  { slug: "tocantins", rotulo: "Tocantins", x: 1390, y: 380, delay: "0.8s" },
  { slug: "goias", rotulo: "Goiás", x: 1250, y: 1260, delay: "1.2s" },
  { slug: "distrito-federal", rotulo: "DF", x: 1620, y: 990, delay: "1.6s" },
  { slug: "mato-grosso-do-sul", rotulo: "MS", x: 750, y: 1660, delay: "2s" },
];

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
        <rect x={pin.x - largura / 2} y={pin.y + 22} rx="34" width={largura} height="68" fill="#050c42" opacity="0.94" stroke="rgba(248,192,56,0.5)" strokeWidth="2" />
        <text x={pin.x} y={pin.y + 68} textAnchor="middle" fontSize="38" fontWeight="800" fill="#ffffff" fontFamily="inherit">
          {rotulo}
        </text>
      </g>
    </Link>
  );
}

/** Seção do seletor de regiões: números editoriais, lista land-book e mapa em relevo. */
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
        className="absolute inset-0 bg-gradient-to-b from-brand-950/95 via-brand-950/40 to-brand-950/95"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-24">
        <Reveal className="border-b border-white/10 pb-16">
          <StatsTiles />
        </Reveal>
        <div className="mt-20 grid items-center gap-x-16 gap-y-14 lg:grid-cols-12">
          {/* Esquerda — título e lista */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-gold-400">
                <span aria-hidden>✦</span> 6 regiões, {totalEscolas} escolas
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tighter text-white sm:text-6xl">
                Encontre uma
                <br />
                escola perto
                <br />
                de você
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-10">
              <div className="flex flex-col border-t border-white/10">
                {estados.map((e, i) => (
                  <Link
                    key={e.slug}
                    href={`/${e.slug}`}
                    className="group relative flex items-center gap-5 border-b border-white/10 py-4 transition-all duration-300 hover:pl-4"
                  >
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 h-px w-0 bg-gold-400 transition-all duration-500 group-hover:w-full"
                    />
                    <span className="w-8 text-sm font-extrabold text-white/30">
                      0{i + 1}
                    </span>
                    <span className="flex-grow text-lg font-extrabold tracking-tight text-white">
                      {e.nome}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                      {e.escolas.length} unidades
                    </span>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:bg-gold-400 group-hover:text-brand-950">
                      <ArrowRight aria-hidden className="size-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
          {/* Direita — mapa em relevo */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <MapaInterativo
              pins={PINS.map((p) => ({
                slug: p.slug,
                rotulo: p.rotulo,
                contagem:
                  estados.find((e) => e.slug === p.slug)?.escolas.length ?? 0,
                x: p.x,
                y: p.y,
              }))}
              fallback={
            <svg
              viewBox={MAPA_VIEWBOX}
              role="img"
              aria-label="Mapa do Centro-Oeste com as regiões da Educação Adventista"
              className="mx-auto w-full max-w-[680px] font-sans drop-shadow-[0_28px_48px_rgba(0,0,0,0.45)]"
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
              }
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
