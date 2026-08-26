"use client";

import { useEffect, useRef } from "react";

/**
 * Constelação de partículas douradas com linhas entre vizinhas,
 * flutuando devagar sobre as seções escuras. Canvas leve: ~60 pontos,
 * 30fps, pausa fora da tela e vira um quadro estático com
 * prefers-reduced-motion.
 */
export default function Constelacao({
  className = "",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let largura = 0;
    let altura = 0;
    let pontos: { x: number; y: number; vx: number; vy: number; r: number; dourado: boolean }[] = [];
    let quadro = 0;
    let visivel = true;
    let ultimo = 0;

    function dimensionar() {
      const caixa = canvas!.getBoundingClientRect();
      largura = caixa.width;
      altura = caixa.height;
      canvas!.width = largura * dpr;
      canvas!.height = altura * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const alvo = Math.min(84, Math.round((largura * altura) / 17000));
      pontos = Array.from({ length: alvo }, (_, i) => ({
        // posições determinísticas espalhadas (sem Math.random para SSR-safe)
        x: ((i * 137.508) % 360) / 360 * largura,
        y: ((i * 97.35 + 45) % 233) / 233 * altura,
        vx: (((i * 7) % 10) - 5) / 55,
        vy: (((i * 13) % 10) - 5) / 55,
        r: 0.8 + ((i * 11) % 10) / 9,
        dourado: i % 3 !== 0,
      }));
    }

    function desenhar() {
      ctx!.clearRect(0, 0, largura, altura);
      const LIMITE = 135;
      for (let i = 0; i < pontos.length; i++) {
        const a = pontos[i];
        for (let j = i + 1; j < pontos.length; j++) {
          const b = pontos[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LIMITE * LIMITE) {
            const alfa = 0.16 * (1 - Math.sqrt(d2) / LIMITE);
            ctx!.strokeStyle = `rgba(248, 192, 56, ${alfa})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      for (const p of pontos) {
        ctx!.fillStyle = p.dourado
          ? "rgba(248, 192, 56, 0.55)"
          : "rgba(138, 160, 244, 0.5)";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function passo(agora: number) {
      quadro = requestAnimationFrame(passo);
      if (!visivel || agora - ultimo < 33) return; // ~30fps
      ultimo = agora;
      for (const p of pontos) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = largura + 10;
        if (p.x > largura + 10) p.x = -10;
        if (p.y < -10) p.y = altura + 10;
        if (p.y > altura + 10) p.y = -10;
      }
      desenhar();
    }

    dimensionar();
    desenhar();

    const aoRedimensionar = () => {
      dimensionar();
      desenhar();
    };
    window.addEventListener("resize", aoRedimensionar);

    let observador: IntersectionObserver | null = null;
    if (!reduzido) {
      observador = new IntersectionObserver(([e]) => {
        visivel = e.isIntersecting;
      });
      observador.observe(canvas);
      quadro = requestAnimationFrame(passo);
    }

    return () => {
      cancelAnimationFrame(quadro);
      observador?.disconnect();
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
