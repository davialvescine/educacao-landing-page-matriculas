"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BedDouble, GraduationCap, Users } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
      const linhas = gsap.utils.toArray<HTMLElement>(".casa-linha", alvo);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: alvo,
            // Folgado de propósito: gatilho apertado deixa o texto
            // invisível quando a página abre já rolada, vinda de uma âncora.
            start: "top 92%",
            once: true,
            // A rede de segurança conta a partir DAQUI, e não do
            // carregamento: a animação começa quando a seção entra na
            // tela, e uma rede que já tinha disparado antes disso não
            // protege nada. Em aba de segundo plano o rAF congela com o
            // texto no meio do caminho — este prazo o destrava.
            onEnter: () => {
              window.setTimeout(() => {
                gsap.set(alvo.querySelectorAll(".casa-fade"), { opacity: 1, y: 0 });
                gsap.set(linhas, { yPercent: 0 });
              }, 1500);
            },
          },
        })
        .from(linhas, {
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

    }, alvo);

    // As fotos mudam a altura da página depois de carregar; sem recalcular,
    // o gatilho fica preso numa posição que não existe mais.
    const recalcular = () => ScrollTrigger.refresh();
    window.addEventListener("load", recalcular);

    // Rede de segurança: se por qualquer motivo o gatilho não disparar,
    // o texto aparece mesmo assim. Conteúdo invisível é pior que sem animação.
    const destravar = window.setTimeout(() => {
      gsap.set(alvo.querySelectorAll(".casa-fade"), { opacity: 1, y: 0 });
      gsap.set(alvo.querySelectorAll(".casa-linha"), { yPercent: 0 });
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
          <p className="casa-fade text-xs font-extrabold uppercase tracking-[0.24em] text-gold-600">
            Por que internato
          </p>
          <h2 className="casa-titulo mt-4 text-3xl font-extrabold leading-[1.08] tracking-tighter text-brand-950 sm:text-5xl">
            {/* Linhas marcadas à mão, não fatiadas pelo SplitText: ele
                tropeçava no <br> e a caixa do título ficava com a altura
                de uma linha só — o parágrafo subia por cima da segunda. */}
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="casa-linha block">A casa e a escola</span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="casa-linha block">no mesmo lugar</span>
            </span>
          </h2>
          <p className="casa-fade mt-6 max-w-xl text-xl leading-relaxed text-brand-950">
            O tempo que se perde no deslocamento vira{" "}
            <span className="font-extrabold">estudo, esporte e convivência</span>.
          </p>

          {/* Três provas em vez de dois parágrafos: a família lê em
              varredura, e cada uma responde a uma pergunta que ela já
              trouxe de casa. */}
          <ul className="mt-9 flex flex-col divide-y divide-line border-y border-line">
            {[
              {
                Icone: BedDouble,
                titulo: "Dormitório e refeitório no campus",
                texto: "Sem trânsito entre a aula e o treino, sem depender de carona para a atividade da tarde.",
              },
              {
                Icone: GraduationCap,
                titulo: "Da Educação Infantil ao Ensino Médio",
                texto: "Uma estrutura de ponta com o material didático próprio da rede e professores que conhecem o aluno pelo nome.",
              },
              {
                Icone: Users,
                titulo: "Gente cuidando o dia inteiro",
                texto: "Equipe responsável pelos alunos fora da sala, com rotina definida e acompanhamento diário.",
              },
            ].map(({ Icone, titulo, texto }, i) => (
              <li key={titulo} className="casa-fade flex gap-5 py-5">
                <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                  <Icone aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="flex items-baseline gap-3 text-lg font-extrabold tracking-tight text-brand-950">
                    <span className="text-xs font-extrabold tabular-nums text-gold-600">
                      0{i + 1}
                    </span>
                    {titulo}
                  </p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{texto}</p>
                </div>
              </li>
            ))}
          </ul>

          <dl className="casa-fade mt-8 grid max-w-lg grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gold-400 px-5 py-4">
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-brand-950/70">
                Onde fica
              </dt>
              <dd className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-brand-950">
                Abadiânia, GO
              </dd>
              <dd className="mt-0.5 text-sm text-brand-950/70">
                100 km de Brasília e de Goiânia
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface px-5 py-4">
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground">
                Regime
              </dt>
              <dd className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-brand-950">
                Internato
              </dd>
              <dd className="mt-0.5 text-sm text-muted-foreground">
                escola e moradia no campus
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
