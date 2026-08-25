"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface FotoAluno {
  src: string;
  w: number;
  h: number;
}

/** Crossfade ambiente entre os alunos da campanha (sem controles). */
export default function FotoRotativa({ fotos }: { fotos: FotoAluno[] }) {
  const [ativa, setAtiva] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return;
    // Cada visita começa num aluno diferente (janela de 5 min define o rosto do momento)
    const CINCO_MIN = 5 * 60 * 1000;
    setAtiva(Math.floor(Date.now() / CINCO_MIN) % fotos.length);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setAtiva((a) => (a + 1) % fotos.length);
    }, CINCO_MIN);
    return () => clearInterval(id);
  }, [fotos.length]);

  return (
    <div className="relative flex h-[440px] w-full items-end justify-center sm:h-[520px] lg:h-[620px] xl:h-[680px]">
      {fotos.map((f, i) => (
        <Image
          key={f.src}
          src={f.src}
          alt={i === ativa ? "Estudante da Educação Adventista" : ""}
          width={f.w}
          height={f.h}
          priority={i === 0}
          className={`absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 transition-opacity duration-[2500ms] ease-in-out ${
            i === ativa ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
