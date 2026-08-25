import { Globe2, HeartHandshake, Landmark } from "lucide-react";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";

const CARTOES: { destaque: string; icone: React.ReactNode; texto: React.ReactNode }[] = [
  {
    destaque: "Formação integral",
    icone: <HeartHandshake aria-hidden className="size-5" />,
    texto: (
      <>
        A Rede de Educação Adventista, estabelecida em{" "}
        <strong className="font-bold text-white">princípios e valores cristãos</strong>,
        compromete-se não apenas com a excelência pedagógica e o desempenho
        acadêmico dos alunos, mas também com sua{" "}
        <strong className="font-bold text-white">formação integral</strong>.
      </>
    ),
  },
  {
    destaque: "Mundo de possibilidades",
    icone: <Globe2 aria-hidden className="size-5" />,
    texto: (
      <>
        Com infraestrutura moderna e segura, professores qualificados e
        materiais didáticos exclusivos, promove uma aprendizagem significativa
        que abre um{" "}
        <strong className="font-bold text-white">
          mundo de possibilidades aos estudantes
        </strong>
        .
      </>
    ),
  },
  {
    destaque: "Desde 1896 no Brasil",
    icone: <Landmark aria-hidden className="size-5" />,
    texto: (
      <>
        No Brasil, desde 1896, a Educação Adventista tem educado gerações,
        oferecendo ensino da Educação Infantil ao Ensino Superior — reconhecida
        entre as{" "}
        <strong className="font-bold text-white">
          maiores redes confessionais do mundo
        </strong>
        .
      </>
    ),
  },
];

/** Seção "Educação Adventista no mundo" — dark premium com globo 3D. */
export default function MundoSection() {
  return (
    <section
      id="mundo"
      className="relative scroll-mt-10 overflow-hidden bg-brand-950"
    >
      {/* Auroras */}
      <div
        aria-hidden
        className="anim-aurora absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-gold-500/15 blur-[130px]"
      />
      <div
        aria-hidden
        className="anim-aurora absolute -bottom-52 -right-32 h-[36rem] w-[36rem] rounded-full bg-brand-500/25 blur-[130px]"
        style={{ animationDelay: "-9s" }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 py-32 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-gold-400">
              <span aria-hidden>✦</span> Uma rede global
            </p>
            <h2 className="mt-5 text-5xl font-extrabold leading-[0.98] tracking-tighter text-white sm:text-7xl">
              Educação
              <br />
              Adventista
              <br />
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent">
                no mundo
              </span>
            </h2>
          </Reveal>
          <div className="mt-12 flex flex-col gap-4">
            {CARTOES.map((c, i) => (
              <Reveal key={c.destaque} delay={i * 0.1}>
                <div className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/40 hover:bg-white/[0.09]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-gold-400/15 text-gold-300">
                    {c.icone}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-gold-400">
                      {c.destaque}
                    </p>
                    <p className="mt-2 leading-relaxed text-white/70">{c.texto}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.15} className="relative mx-auto w-full max-w-[460px]">
          <div
            aria-hidden
            className="absolute -inset-8 rounded-full bg-gold-400/20 blur-[60px]"
          />
          {/* Órbitas com satélites */}
          <div
            aria-hidden
            className="anim-orbita absolute -inset-7 rounded-full border border-dashed border-white/15"
          >
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400 shadow-[0_0_16px_rgba(248,192,56,0.9)]" />
          </div>
          <div
            aria-hidden
            className="anim-orbita-rev absolute -inset-14 rounded-full border border-white/[0.07]"
          >
            <span className="absolute bottom-[12%] right-[6%] h-2 w-2 rounded-full bg-brand-300 shadow-[0_0_12px_rgba(138,160,244,0.9)]" />
            <span className="absolute left-[8%] top-[18%] h-2.5 w-2.5 rounded-full bg-gold-300 shadow-[0_0_14px_rgba(248,224,104,0.9)]" />
          </div>
          <div className="relative rounded-full shadow-[0_40px_100px_rgba(0,0,0,0.55)]">
            <div
              aria-hidden
              className="anim-orbita absolute -inset-1.5 rounded-full [background:conic-gradient(from_140deg,#f8e068,#f8a010,#12269e_55%,#f8e068)]"
            />
            <video
              src="/videos/globo.mp4"
              poster="/videos/globo-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Globo terrestre em 3D girando"
              className="relative aspect-square w-full rounded-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-1/2 flex w-max -translate-x-1/2 items-baseline gap-2 rounded-full border border-white/15 bg-brand-900/90 px-6 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <span className="text-2xl font-extrabold tracking-tight text-gold-300">
              <CountUp valor="+2.000.000" />
            </span>
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-white/60">
              alunos no mundo
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
