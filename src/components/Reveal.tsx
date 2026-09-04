"use client";

import { useLayoutEffect, useRef } from "react";

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
 * O elemento NASCE visível. Quem o esconde é este componente, num layout
 * effect (antes de pintar), e só se ele ainda não está na tela. Assim:
 * sem JS, tudo aparece; com JS, o que está acima da dobra nunca pisca, e
 * o que está abaixo é escondido antes de alguém rolar até lá. Nenhum
 * script inline — as duas versões anteriores tentaram marcar o <html>
 * com script e o Next recusou as duas.
 *
 * Há ainda uma rede de segurança por tempo: se o observador não disparar
 * (aba em segundo plano, navegador antigo), o conteúdo aparece do mesmo
 * jeito. Conteúdo invisível é pior que sem animação.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mostrar = () => el.classList.add("is-visible");

    if (typeof IntersectionObserver === "undefined") {
      mostrar();
      return;
    }
    // A decisão de esconder é SÍNCRONA, aqui, antes de pintar: a primeira
    // callback do observador chega depois do quadro, e conteúdo na borda
    // de baixo da tela pintaria visível, sumiria e voltaria. Só o que
    // começa abaixo da dobra é escondido; o observador apenas revela.
    const topo = el.getBoundingClientRect().top;
    if (topo > window.innerHeight - 40) el.classList.add("reveal-oculto");
    else mostrar();

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
