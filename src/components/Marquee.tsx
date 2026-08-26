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
          className="flex items-center gap-8 pr-8 text-xs font-extrabold uppercase tracking-[0.22em] text-brand-950"
        >
          {t}
          <span aria-hidden className="text-[10px] text-brand-950/45">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative z-10 -mt-1 overflow-hidden border-y border-white/30 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 py-3.5 shadow-[0_10px_30px_rgba(18,38,158,0.25),inset_0_1px_0_rgba(255,255,255,0.45)]">
      <div className="anim-marquee flex w-max">
        {linha(false)}
        {linha(true)}
        {linha(true)}
        {linha(true)}
      </div>
    </div>
  );
}
