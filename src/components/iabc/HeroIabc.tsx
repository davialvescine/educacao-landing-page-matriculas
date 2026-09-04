"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export interface QuadroHero {
  src: string;
  alt: string;
}

const TROCA = 5200;

/**
 * Capa do internato.
 *
 * Composição editorial: a foto ocupa a tela inteira e o texto se apoia na
 * base, alinhado à esquerda, sem caixa e sem centralizar. Quem dá o clima
 * é a imagem; o texto entrega a frase em poucas palavras.
 *
 * Três movimentos, cada um com função:
 *  · as fotos se revezam devagar, porque uma imagem só não mostra o campus
 *  · cada uma cresce de leve enquanto está no ar, o que tira a sensação de
 *    slide parado
 *  · o título sobe linha a linha na entrada, e a imagem afunda um pouco
 *    quando a página rola, passando a vez para a seção seguinte
 *
 * Sem JS o conteúdo aparece inteiro, com a primeira foto. Sob
 * prefers-reduced-motion nada se move e a troca automática não acontece.
 */
export default function HeroIabc({
  quadros,
  children,
}: {
  quadros: QuadroHero[];
  children: React.ReactNode;
}) {
  const secao = useRef<HTMLElement>(null);
  const fundo = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (quadros.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setAtual((i) => (i + 1) % quadros.length),
      TROCA,
    );
    return () => clearInterval(t);
  }, [quadros.length]);

  useEffect(() => {
    const alvo = secao.current;
    if (!alvo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const titulo = alvo.querySelector<HTMLElement>(".hero-titulo");
      const apoio = alvo.querySelectorAll<HTMLElement>(".hero-entra");

      const linhas = titulo
        ? new SplitText(titulo, { type: "lines", linesClass: "hero-linha" })
        : null;

      const tl = gsap.timeline({ delay: 0.15 });
      if (linhas) {
        tl.from(linhas.lines, {
          yPercent: 115,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
        });
      }
      tl.from(
        apoio,
        { opacity: 0, y: 20, duration: 0.7, ease: "power2.out", stagger: 0.1 },
        linhas ? "-=0.6" : 0,
      );

      // A capa afunda de leve ao sair, passando a vez para a seção seguinte.
      if (fundo.current) {
        gsap.to(fundo.current, {
          yPercent: 12,
          scale: 1.06,
          ease: "none",
          scrollTrigger: {
            trigger: alvo,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      return () => linhas?.revert();
    }, alvo);

    // Rede de segurança: conteúdo invisível é pior que sem animação.
    const destravar = window.setTimeout(() => {
      gsap.set(alvo.querySelectorAll(".hero-entra"), { opacity: 1, y: 0 });
    }, 2500);

    return () => {
      window.clearTimeout(destravar);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={secao}
      className="relative isolate min-h-[100dvh] overflow-hidden bg-brand-950"
    >
      <div ref={fundo} className="absolute inset-0 -z-10">
        {quadros.map((q, i) => (
          <Image
            key={q.src}
            src={q.src}
            alt={i === 0 ? q.alt : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            aria-hidden={i !== atual}
            className={`object-cover object-center transition-opacity duration-[1400ms] ease-out motion-reduce:transition-none ${
              i === atual ? "opacity-100" : "opacity-0"
            } ${i === atual ? "anim-respiro" : ""}`}
          />
        ))}
      </div>

      {/* Véu: a foto precisa continuar foto, e o texto precisa ser legível */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 via-brand-950/45 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/80 via-brand-950/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-brand-950/60 to-transparent"
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:pb-24">
        {children}
      </div>

    </section>
  );
}
