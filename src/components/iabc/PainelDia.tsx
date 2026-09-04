"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface MomentoDia {
  src: string;
  titulo: string;
  texto: string;
}

/**
 * O dia no campus como panorâmica presa à rolagem.
 *
 * O movimento tem uma razão: a família está tentando imaginar como é o dia
 * do filho, e o dia é uma sequência. Prender a seção e correr as fotos na
 * horizontal faz a rolagem virar a passagem do tempo. Não é enfeite.
 *
 * No celular a seção não é presa: sequestrar o scroll em tela pequena é
 * hostil, e a faixa vira rolagem horizontal normal com encaixe. Sob
 * prefers-reduced-motion, nada é preso e nada anima.
 */
export default function PainelDia({ momentos }: { momentos: MomentoDia[] }) {
  const secao = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = secao.current;
    const faixa = trilho.current;
    if (!alvo || !faixa) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    const telaGrande = window.matchMedia("(min-width: 1024px)");
    if (semMovimento.matches || !telaGrande.matches) return;

    const ctx = gsap.context(() => {
      const distancia = () => faixa.scrollWidth - window.innerWidth + 96;

      gsap.to(faixa, {
        x: () => -distancia(),
        ease: "none",
        scrollTrigger: {
          trigger: alvo,
          start: "top top",
          end: () => `+=${distancia()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // As legendas entram com a foto, não todas de uma vez.
      gsap.from(gsap.utils.toArray<HTMLElement>(".momento-texto"), {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.12,
        scrollTrigger: { trigger: alvo, start: "top top" },
      });
    }, alvo);

    // Rede de segurança: `gsap.from` esconde na hora e só mostra quando o
    // gatilho dispara. Se ele não disparar — página aberta já rolada,
    // aba em segundo plano — as legendas ficariam invisíveis para sempre.
    const destravar = window.setTimeout(() => {
      gsap.set(alvo.querySelectorAll(".momento-texto"), { opacity: 1, y: 0 });
    }, 2500);

    return () => {
      window.clearTimeout(destravar);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={secao}
      className="relative overflow-hidden bg-brand-950 py-24 lg:h-[100dvh] lg:py-0"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:pt-20">
        <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tighter text-white sm:text-5xl">
          Um dia dentro do campus
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
          Fotos reais das unidades e da rotina, não banco de imagens.
        </p>
      </div>

      <div
        ref={trilho}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:px-6 lg:mt-14 lg:w-max lg:snap-none lg:overflow-visible lg:pb-0"
      >
        {momentos.map((m) => (
          <figure
            key={m.titulo}
            className="w-[78vw] shrink-0 snap-start sm:w-[42vw] lg:w-[30vw]"
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-card">
              <Image
                src={m.src}
                alt={m.titulo}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 42vw, 78vw"
                className="object-cover"
              />
            </div>
            <figcaption className="momento-texto mt-4">
              <p className="text-lg font-extrabold tracking-tight text-white">
                {m.titulo}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-white/65">
                {m.texto}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
