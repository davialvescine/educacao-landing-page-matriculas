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
  /** Hora aproximada do dia, ex.: "07h". É o que transforma uma fileira
   *  de fotos em um DIA: a família consegue imaginar o filho às 14h. */
  hora: string;
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
  const progresso = useRef<HTMLDivElement>(null);

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
          onUpdate: (st) => {
            if (progresso.current) {
              progresso.current.style.transform = `scaleX(${st.progress})`;
            }
          },
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
      {/* Textura de fundo: sem ela o navy chapado virava um bloco morto
          entre duas seções claras. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(248,192,56,0.12),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:pt-20">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold-300">
          Das 6h30 às 22h
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.02] tracking-tighter text-white sm:text-5xl lg:text-6xl">
            Um dia inteiro
            <br />
            dentro do campus
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-white/70">
            Fotos reais do IABC, não banco de imagens. Role para acompanhar o
            dia, do primeiro sinal ao último.
          </p>
        </div>

        {/* Linha do tempo: enche conforme a faixa anda. É o relógio da
            seção — diz em que ponto do dia a família está. */}
        <div className="mt-8 hidden h-px w-full bg-white/15 lg:block">
          <div ref={progresso} className="h-px w-full origin-left scale-x-0 bg-gold-400" />
        </div>
      </div>

      <div
        ref={trilho}
        className="relative mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:px-6 lg:mt-12 lg:w-max lg:snap-none lg:overflow-visible lg:pb-0"
      >
        {momentos.map((m, i) => (
          <figure
            key={m.titulo}
            className="group w-[78vw] shrink-0 snap-start sm:w-[42vw] lg:w-[30vw]"
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-card">
              <Image
                src={m.src}
                alt={m.titulo}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 42vw, 78vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              {/* Véu só embaixo, para a hora e o título lerem sobre
                  qualquer foto sem escurecer a imagem inteira. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-950/85 to-transparent"
              />
              <span className="absolute left-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-xs font-extrabold tabular-nums tracking-wider text-brand-950">
                {m.hora}
              </span>
              <p className="absolute bottom-4 left-4 right-4 text-2xl font-extrabold tracking-tight text-white">
                {m.titulo}
              </p>
            </div>
            <figcaption className="momento-texto mt-4 flex gap-3">
              <span className="text-sm font-extrabold tabular-nums text-gold-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="max-w-sm text-sm leading-relaxed text-white/70">
                {m.texto}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
