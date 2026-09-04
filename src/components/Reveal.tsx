"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Atraso em segundos para efeito cascata. */
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}

/**
 * Revela o conteúdo com fade + slide quando entra na viewport.
 *
 * O estado escondido vive no CSS, sob `@media (scripting: enabled)`: sem
 * JS o texto simplesmente aparece. E mesmo com JS há uma rede de
 * segurança por tempo — se o observador não disparar (página aberta já
 * rolada por uma âncora, navegador antigo, aba em segundo plano), o
 * conteúdo aparece do mesmo jeito. Conteúdo invisível é pior que sem
 * animação; a primeira versão deste arquivo deixava seções em branco.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mostrar = () => el.classList.add("is-visible");

    if (typeof IntersectionObserver === "undefined") {
      mostrar();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            mostrar();
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);

    // Rede de segurança: contada a partir do momento em que o elemento
    // entra na tela, não do carregamento — senão seções lá embaixo
    // apareceriam sem animação antes de alguém chegar nelas.
    const vigia = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        window.setTimeout(mostrar, 1200);
        vigia.disconnect();
      }
    });
    vigia.observe(el);

    return () => {
      io.disconnect();
      vigia.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ "--delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
