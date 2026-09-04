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
  const anterior = useRef(0);

  useEffect(() => {
    if (quadros.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setAtual((i) => (i + 1) % quadros.length),
      TROCA,
    );
    return () => clearInterval(t);
  }, [quadros.length]);

  // A foto nova entra por cortina, não por fade. O fade é a transição que
  // todo carrossel faz; a cortina dá direção ao movimento e faz a troca
  // parecer decisão, não desbotamento.
  useEffect(() => {
    const quadro = fundo.current?.querySelector<HTMLElement>(
      `[data-quadro="${atual}"]`,
    );
    if (!quadro) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(quadro, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
      return;
    }
    gsap.fromTo(
      quadro,
      { clipPath: "inset(0% 0% 0% 100%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.15,
        ease: "power3.inOut",
      },
    );
  }, [atual]);

  // Guarda quem estava no ar: é ela que fica embaixo durante a cortina.
  useEffect(() => {
    const t = window.setTimeout(() => {
      anterior.current = atual;
    }, 1200);
    return () => window.clearTimeout(t);
  }, [atual]);

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
      className="relative isolate min-h-[100dvh] overflow-hidden bg-neutral-900"
    >
      <div ref={fundo} className="absolute inset-0 -z-10">
        {quadros.map((q, i) => (
          <div
            key={q.src}
            data-quadro={i}
            aria-hidden={i !== atual}
            className="absolute inset-0"
            style={{
              // Ninguém some: a foto que sai continua no ar por baixo da
              // cortina. Apagar a de baixo é o que deixava o fundo da
              // seção aparecer por um instante, e era isso que piscava.
              zIndex: i === atual ? 3 : i === anterior.current ? 2 : 1,
              clipPath: i === atual ? undefined : "inset(0% 0% 0% 0%)",
            }}
          >
            <Image
              src={q.src}
              alt={i === 0 ? q.alt : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover object-center ${i === atual ? "anim-respiro" : ""}`}
            />
          </div>
        ))}
      </div>

      {/* Véu neutro de propósito: navy por cima de foto de luz quente
          esfria a imagem inteira e some com o fim de tarde. Preto em baixa
          opacidade escurece sem tingir, e a foto continua com a cor dela. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/15 to-transparent"
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:pb-24">
        {children}
      </div>

    </section>
  );
}
