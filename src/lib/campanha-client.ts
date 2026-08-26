"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * Utilidades de campanha no navegador: captura de UTM na chegada e
 * eventos de conversão (GA4 + Meta Pixel). Tudo tolerante a falha:
 * medição nunca pode quebrar o funil.
 */

const CHAVE_STORAGE = "ea-utm";
const PARAMETROS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

/** Guarda os parâmetros de campanha da URL (primeira visita da sessão). */
export function capturarUtm(): void {
  try {
    const query = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const p of PARAMETROS) {
      const v = query.get(p);
      if (v) utm[p] = v.slice(0, 200);
    }
    if (Object.keys(utm).length) {
      sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(utm));
    }
  } catch {
    // storage indisponível (modo privado etc.): segue sem rastreio
  }
}

/** Lê as UTMs capturadas para anexar ao lead. */
export function lerUtm(): Record<string, string> | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE_STORAGE);
    return bruto ? (JSON.parse(bruto) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

type Fbq = (comando: string, evento: string, params?: object) => void;

function fbq(): Fbq | null {
  const f = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof f === "function" ? f : null;
}

/** Conversão principal: formulário de lead enviado. */
export function eventoLead(params: {
  regiao: string;
  nivel?: string;
  escola?: string;
}): void {
  try {
    sendGAEvent("event", "generate_lead", {
      regiao: params.regiao,
      nivel: params.nivel ?? "",
      escola: params.escola ?? "",
    });
  } catch {}
  try {
    fbq()?.("track", "Lead", { content_category: params.regiao });
  } catch {}
}

/** Conversão secundária: clique para conversar no WhatsApp. */
export function eventoWhats(regiao: string): void {
  try {
    sendGAEvent("event", "whatsapp_click", { regiao });
  } catch {}
  try {
    fbq()?.("track", "Contact", { content_category: regiao });
  } catch {}
}
