"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#regioes", label: "Nossas regiões" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#iabc", label: "IABC" },
];

/**
 * Barra transparente sobre a capa, que ganha vidro fosco ao rolar.
 *
 * Fundo sólido em cima da capa corta a foto em duas e mata o full-bleed.
 * Fundo nenhum depois da capa deixa o menu ilegível sobre seção clara. A
 * troca resolve os dois, e o escurecimento é neutro: navy por cima de
 * foto de luz quente esfria a imagem.
 *
 * Quem detecta a rolagem é um sensor de 1px no topo, observado pelo
 * IntersectionObserver. Ouvir o evento de scroll dispararia a cada quadro
 * e travaria a rolagem no celular.
 */
export default function Header() {
  const sensor = useRef<HTMLDivElement>(null);
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const alvo = sensor.current;
    if (!alvo) return;
    const obs = new IntersectionObserver(
      ([entrada]) => setRolou(!entrada.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div ref={sensor} aria-hidden className="absolute top-0 h-px w-px" />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ease-out motion-reduce:transition-none",
          rolou
            ? "bg-neutral-900/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
            : "bg-gradient-to-b from-black/45 to-transparent",
        )}
      >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Página inicial">
          <Image
            src="/imagens/logos/logo_colegio.png"
            alt="Educação Adventista"
            width={502}
            height={150}
            className="h-10 w-auto drop-shadow-[0_2px_8px_rgba(120,60,0,0.25)] sm:h-11"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-white md:flex [text-shadow:0_1px_6px_rgba(120,60,0,0.35)]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-opacity hover:opacity-80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href="#matricula"
          className={cn(
            buttonVariants(),
            "h-11 rounded-full px-6 text-sm font-bold shadow-cta",
          )}
        >
          Quero matricular
        </a>
        </div>
      </header>
    </>
  );
}
