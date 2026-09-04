"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export interface FotoAluno {
  src: string;
  w: number;
  h: number;
}

/** De quanto em quanto tempo o aluno da capa muda. */
const TROCA = 6000;

/**
 * Os alunos da campanha se revezando na capa.
 *
 * A primeira versão trocava a cada CINCO MINUTOS, com crossfade. Ninguém
 * ficava tanto tempo na capa, então a troca não existia na prática — e
 * crossfade entre dois recortes de pessoa mostra os dois corpos
 * sobrepostos no meio do caminho, o que fica estranho.
 *
 * Agora a foto que sai desce e some; a que entra sobe de baixo, um pouco
 * menor, e assenta. Cada uma se move sozinha, sem sobreposição
 * transparente, e o movimento de subir combina com uma pessoa entrando em
 * cena. A cada visita a sequência começa num aluno diferente, para a
 * capa não ter "o rosto padrão".
 *
 * Sob prefers-reduced-motion não há troca. Rede de segurança por tempo:
 * em aba de segundo plano o requestAnimationFrame congela e a foto nova
 * ficaria parada fora do lugar; o setTimeout garante que ela assenta.
 */
export default function FotoRotativa({ fotos }: { fotos: FotoAluno[] }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [ativa, setAtiva] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    if (fotos.length < 2) return;
    const inicial = Math.floor(Date.now() / 60_000) % fotos.length;
    anterior.current = inicial;
    setAtiva(inicial);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setAtiva((a) => (a + 1) % fotos.length), TROCA);
    return () => clearInterval(id);
  }, [fotos.length]);

  useEffect(() => {
    const raiz = caixa.current;
    if (!raiz) return;
    const entra = raiz.querySelector<HTMLElement>(`[data-foto="${ativa}"]`);
    const sai = raiz.querySelector<HTMLElement>(`[data-foto="${anterior.current}"]`);
    anterior.current = ativa;
    if (!entra) return;

    if (entra === sai || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(entra, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    const tl = gsap.timeline();
    if (sai) {
      tl.to(sai, { autoAlpha: 0, y: 40, duration: 0.55, ease: "power2.in" }, 0);
    }
    tl.fromTo(
      entra,
      { autoAlpha: 0, y: 70, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.95, ease: "power3.out" },
      0.25,
    );

    const garantir = window.setTimeout(() => {
      gsap.set(entra, { autoAlpha: 1, y: 0, scale: 1 });
      if (sai) gsap.set(sai, { autoAlpha: 0 });
    }, 1600);

    return () => {
      window.clearTimeout(garantir);
      tl.kill();
    };
  }, [ativa]);

  return (
    <div
      ref={caixa}
      className="relative flex h-[440px] w-full items-end justify-center overflow-hidden sm:h-[520px] lg:h-[620px] xl:h-[680px]"
    >
      {fotos.map((f, i) => (
        <div
          key={f.src}
          data-foto={i}
          className="absolute bottom-0 left-1/2 z-10 h-full -translate-x-1/2 will-change-transform"
          // A primeira aparece sem JS; as outras nascem invisíveis e só o
          // GSAP as revela. Aqui em estilo inline, e não em classe, para
          // o próprio GSAP conseguir sobrescrever sem briga com o CSS.
          style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
        >
          <Image
            src={f.src}
            alt={i === ativa ? "Estudante da Educação Adventista" : ""}
            width={f.w}
            height={f.h}
            priority={i === 0}
            className="h-full w-auto max-w-none"
          />
        </div>
      ))}
    </div>
  );
}
