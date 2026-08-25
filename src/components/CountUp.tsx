"use client";

import { useEffect, useRef } from "react";

/**
 * Contador animado que respeita o formato original do valor
 * (ex.: "9.800", "+2.000.000") e prefers-reduced-motion.
 */
export default function CountUp({ valor }: { valor: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const alvo = parseInt(valor.replace(/\D/g, ""), 10);
    if (!Number.isFinite(alvo) || alvo === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const prefixo = valor.startsWith("+") ? "+" : "";
    const formata = (n: number) =>
      prefixo + n.toLocaleString("pt-BR").replace(/,/g, ".");

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const inicio = performance.now();
        const duracao = 1600;
        const tick = (agora: number) => {
          const t = Math.min((agora - inicio) / duracao, 1);
          const easa = 1 - Math.pow(1 - t, 4);
          el.textContent = formata(Math.round(alvo * easa));
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = valor;
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [valor]);

  return <span ref={ref}>{valor}</span>;
}
