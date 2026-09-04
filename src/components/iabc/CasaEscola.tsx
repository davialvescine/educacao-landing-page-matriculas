"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export interface FotoCampus {
  src: string;
  alt: string;
}

const INTERVALO = 4200;

/**
 * "A casa e a escola no mesmo lugar": o argumento central da página.
 *
 * Uma foto só não dava conta. O que convence a família é ver o campus por
 * dentro, então a coluna direita passa por várias imagens, e o texto entra
 * linha a linha conforme a seção sobe. O movimento serve a hierarquia: a
 * frase se monta enquanto o olho já está lendo.
 *
 * A troca automática pausa quando o ponteiro está em cima e some inteira
 * sob prefers-reduced-motion, junto com a animação do texto.
 */
export default function CasaEscola({ fotos }: { fotos: FotoCampus[] }) {
  const secao = useRef<HTMLElement>(null);
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const ir = useCallback(
    (i: number) => setAtual(((i % fotos.length) + fotos.length) % fotos.length),
    [fotos.length],
  );

  // Troca automática: a família vê o campus sem precisar clicar.
  useEffect(() => {
    if (pausado || fotos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAtual((i) => (i + 1) % fotos.length), INTERVALO);
    return () => clearInterval(t);
  }, [pausado, fotos.length]);

  useEffect(() => {
    const alvo = secao.current;
    if (!alvo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const titulo = alvo.querySelector<HTMLElement>(".casa-titulo");
      if (!titulo) return;

      // Esconder só aqui, em tempo de execução: sem JS o texto continua
      // visível, em vez de sumir para sempre.
      gsap.set(alvo.querySelectorAll(".casa-fade"), { opacity: 0 });

      // O título se monta linha a linha; os parágrafos vêm depois, atrás.
      const linhas = new SplitText(titulo, {
        type: "lines",
        linesClass: "casa-linha",
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: alvo,
            // Folgado de propósito: gatilho apertado deixa o texto
            // invisível quando a página abre já rolada, vinda de uma âncora.
            start: "top 92%",
            once: true,
          },
        })
        .from(linhas.lines, {
          yPercent: 118,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.09,
        })
        .to(
          alvo.querySelectorAll<HTMLElement>(".casa-fade"),
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            startAt: { y: 22 },
          },
          "-=0.45",
        );

      return () => linhas.revert();
    }, alvo);

    // As fotos mudam a altura da página depois de carregar; sem recalcular,
    // o gatilho fica preso numa posição que não existe mais.
    const recalcular = () => ScrollTrigger.refresh();
    window.addEventListener("load", recalcular);

    // Rede de segurança: se por qualquer motivo o gatilho não disparar,
    // o texto aparece mesmo assim. Conteúdo invisível é pior que sem animação.
    const destravar = window.setTimeout(() => {
      gsap.set(alvo.querySelectorAll(".casa-fade"), { opacity: 1, y: 0 });
      gsap.set(alvo.querySelectorAll(".casa-linha > *"), { yPercent: 0 });
    }, 2500);

    return () => {
      window.removeEventListener("load", recalcular);
      window.clearTimeout(destravar);
      ctx.revert();
    };
  }, []);

  return (
    <section id="o-campus" ref={secao} className="scroll-mt-10 bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-32">
        <div>
          <h2 className="casa-titulo text-3xl font-extrabold leading-[1.08] tracking-tighter text-brand-950 sm:text-5xl [&_.casa-linha]:overflow-hidden [&_.casa-linha]:pb-[0.12em]">
            A casa e a escola
            <br />
            no mesmo lugar
          </h2>
          <div className="mt-7 flex max-w-xl flex-col gap-5 text-lg leading-relaxed text-muted-foreground">
            <p className="casa-fade">
              O IABC reúne num só lugar uma estrutura de ponta, educação de
              excelência e uma infraestrutura de internato na qual os alunos se
              sentem confortáveis e em casa.
            </p>
            <p className="casa-fade">
              Sem trânsito entre a aula e o treino, sem depender de carona para
              a atividade da tarde. O tempo que se perde no deslocamento vira
              estudo, esporte e convivência.
            </p>
          </div>
          <dl className="casa-fade mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-8">
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">
                Etapas atendidas
              </dt>
              <dd className="mt-1 text-lg font-extrabold tracking-tight text-brand-950">
                Da Educação Infantil ao Ensino Médio
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">
                Onde fica
              </dt>
              <dd className="mt-1 text-lg font-extrabold tracking-tight text-brand-950">
                Abadiânia, a 100 km de Brasília e de Goiânia
              </dd>
            </div>
          </dl>
        </div>

        <div
          className="casa-fade"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-card shadow-foto">
            {fotos.map((foto, i) => (
              <Image
                key={foto.src}
                src={foto.src}
                alt={i === atual ? foto.alt : ""}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority={i === 0}
                aria-hidden={i !== atual}
                className={`object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  i === atual ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            {fotos.map((foto, i) => (
              <button
                key={foto.src}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ver ${foto.alt}`}
                aria-current={i === atual}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === atual
                    ? "w-10 bg-brand-700"
                    : "w-4 bg-brand-200 hover:bg-brand-300"
                }`}
              />
            ))}
            <span className="ml-auto text-sm font-semibold text-muted-foreground">
              {fotos[atual]?.alt}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
