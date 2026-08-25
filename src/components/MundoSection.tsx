import Reveal from "@/components/Reveal";

const CARTOES: { destaque: string; texto: React.ReactNode }[] = [
  {
    destaque: "Formação integral",
    texto: (
      <>
        A Rede de Educação Adventista, estabelecida em{" "}
        <strong className="text-brand-800">princípios e valores cristãos</strong>,
        compromete-se não apenas com a excelência pedagógica e o desempenho
        acadêmico dos alunos, mas também com sua{" "}
        <strong className="text-brand-800">formação integral</strong>.
      </>
    ),
  },
  {
    destaque: "Mundo de possibilidades",
    texto: (
      <>
        Com infraestrutura moderna e segura, professores qualificados e
        materiais didáticos exclusivos, promove uma aprendizagem significativa
        que abre um{" "}
        <strong className="text-brand-800">
          mundo de possibilidades aos estudantes
        </strong>
        .
      </>
    ),
  },
  {
    destaque: "Desde 1896 no Brasil",
    texto: (
      <>
        No Brasil, desde 1896, a Educação Adventista tem educado gerações,
        oferecendo ensino da Educação Infantil ao Ensino Superior — reconhecida
        entre as{" "}
        <strong className="text-brand-800">
          maiores redes confessionais do mundo
        </strong>
        .
      </>
    ),
  },
];

/** Seção "Educação Adventista no mundo" com o globo 3D animado (Magnific). */
export default function MundoSection() {
  return (
    <section id="mundo" className="scroll-mt-10 bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-28 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-brand-500">
              <span aria-hidden className="text-gold-500">
                ✦
              </span>
              Uma rede global
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
              Educação Adventista
              <br />
              <span className="inline-block bg-gold-400 px-3 leading-snug text-brand-950">
                no mundo
              </span>
            </h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-5">
            {CARTOES.map((c, i) => (
              <Reveal key={c.destaque} delay={i * 0.1}>
                <div className="rounded-2xl border border-line bg-paper p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-gold-600">
                    {c.destaque}
                  </p>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {c.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.15} className="relative mx-auto w-full max-w-[480px]">
          <video
            src="/videos/globo.mp4"
            poster="/videos/globo-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Globo terrestre em 3D girando"
            className="aspect-square w-full rounded-full object-cover shadow-[0_32px_80px_rgba(8,18,96,0.25)]"
          />
          <div className="absolute -bottom-4 left-1/2 flex w-max -translate-x-1/2 items-baseline gap-2 rounded-full border border-line bg-surface px-6 py-3 shadow-card-hover">
            <span className="text-2xl font-extrabold tracking-tight text-brand-700">
              +2.000.000
            </span>
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-muted-foreground">
              alunos no mundo
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
