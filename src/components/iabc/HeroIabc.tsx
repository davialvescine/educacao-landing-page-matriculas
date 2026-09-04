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

  // A foto anda para o lado, não pisca.
  //
  // A que entra vem da direita e empurra a cena; a que sai desliza um
  // pouco para a esquerda, mais devagar, e fica atrás. Esse
  // descompasso entre as duas é o que dá profundidade: sem ele, duas
  // imagens andando na mesma velocidade parecem um slide de PowerPoint.
  //
  // Como a nova sempre vem da direita, voltar da última para a primeira
  // não rebobina a tela.
  useEffect(() => {
    const caixa = fundo.current;
    if (!caixa) return;

    const entra = caixa.querySelector<HTMLElement>(`[data-quadro="${atual}"]`);
    const sai = caixa.querySelector<HTMLElement>(
      `[data-quadro="${anterior.current}"]`,
    );
    if (!entra || entra === sai) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(entra, { xPercent: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      entra,
      { xPercent: 100 },
      { xPercent: 0, duration: 1.25, ease: "power3.inOut" },
      0,
    );
    if (sai) {
      tl.fromTo(
        sai,
        { xPercent: 0 },
        { xPercent: -22, duration: 1.25, ease: "power3.inOut" },
        0,
      );
    }
    return () => {
      tl.kill();
    };
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
