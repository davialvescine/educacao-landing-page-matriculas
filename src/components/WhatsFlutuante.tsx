"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export interface RegiaoWhats {
  slug: string;
  nome: string;
  link: string | null;
}

const MENSAGEM = encodeURIComponent(
  "Olá! Quero informações sobre matrículas na Educação Adventista.",
);

function IconeWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden>
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

/** Botão flutuante de WhatsApp: pulsa no canto e direciona ao número
 *  da região (seletor na home; direto nas páginas de região). */
export default function WhatsFlutuante({
  regioes,
  linkDireto,
}: {
  regioes?: RegiaoWhats[];
  linkDireto?: string | null;
}) {
  const [aberto, setAberto] = useState(false);

  const urlDireta = linkDireto ? `${linkDireto}?text=${MENSAGEM}` : null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
      {/* Seletor de região */}
      {aberto && !urlDireta && regioes && (
        <>
          <button
            aria-label="Fechar"
            className="fixed inset-0 -z-10 cursor-default"
            onClick={() => setAberto(false)}
          />
          <div className="w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-card-hover">
            <div className="flex items-center justify-between bg-[#075E54] px-4 py-3">
              <p className="text-sm font-extrabold text-white">
                De qual região você é?
              </p>
              <button
                aria-label="Fechar"
                onClick={() => setAberto(false)}
                className="text-white/80 transition-colors hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {regioes.map((r) =>
                r.link ? (
                  <a
                    key={r.slug}
                    href={`${r.link}?text=${MENSAGEM}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-brand-50"
                    onClick={() => setAberto(false)}
                  >
                    {r.nome}
                    <ArrowRight
                      aria-hidden
                      className="size-4 text-[#25D366] transition-transform group-hover:translate-x-1"
                    />
                  </a>
                ) : (
                  <Link
                    key={r.slug}
                    href="#matricula"
                    className="group flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-900 transition-colors hover:bg-brand-50"
                    onClick={() => setAberto(false)}
                  >
                    {r.nome}
                    <ArrowRight
                      aria-hidden
                      className="size-4 text-brand-400 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                ),
              )}
            </div>
          </div>
        </>
      )}

      {/* Botão */}
      {urlDireta ? (
        <a
          href={urlDireta}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="group relative flex h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 active:scale-95"
        >
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/60 motion-reduce:hidden"
            style={{ animationDuration: "2.4s" }}
          />
          <IconeWhatsApp className="relative size-8" />
        </a>
      ) : (
        <button
          type="button"
          aria-label="Falar no WhatsApp"
          aria-expanded={aberto}
          onClick={() => setAberto((a) => !a)}
          className="group relative flex h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 active:scale-95"
        >
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/60 motion-reduce:hidden"
            style={{ animationDuration: "2.4s" }}
          />
          <IconeWhatsApp className="relative size-8" />
        </button>
      )}
    </div>
  );
}
