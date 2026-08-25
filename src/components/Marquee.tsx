const ITENS = [
  "Matrículas Abertas",
  "#MuitoAlémdoEnsino",
  "130 anos de história",
  "39 escolas no Centro-Oeste",
  "Da Educação Infantil ao Ensino Médio",
];

/** Faixa rolante infinita da campanha (pausa com prefers-reduced-motion). */
export default function Marquee() {
  const linha = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center"
    >
      {ITENS.map((t) => (
        <span
          key={t}
          className="flex items-center gap-6 pr-6 text-sm font-extrabold uppercase tracking-[0.18em] text-primary-foreground"
        >
          {t}
          <span aria-hidden className="text-gold-400">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative z-10 -mt-1 overflow-hidden bg-brand-700 py-3.5 shadow-cta">
      <div className="anim-marquee flex w-max">
        {linha(false)}
        {linha(true)}
        {linha(true)}
        {linha(true)}
      </div>
    </div>
  );
}
