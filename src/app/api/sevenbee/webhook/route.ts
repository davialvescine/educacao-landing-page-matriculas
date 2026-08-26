import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { atualizarAtendimento } from "@/lib/leads";

export const runtime = "nodejs";

/**
 * Recebe eventos do Sevenbee (Ajustes > Integrações > Webhooks).
 * URL a cadastrar lá: https://<dominio>/api/sevenbee/webhook?segredo=<SEVENBEE_WEBHOOK_SEGREDO>
 * Eventos que importam para o funil:
 *   SESSION_CREATED / SESSION_UPDATED -> em_atendimento
 *   SESSION_ENDED                     -> atendido
 */

const STATUS_POR_EVENTO: Record<string, "em_atendimento" | "atendido"> = {
  SESSION_CREATED: "em_atendimento",
  SESSION_UPDATED: "em_atendimento",
  SESSION_ENDED: "atendido",
};

function segredoConfere(recebido: string | null): boolean {
  const esperado = process.env.SEVENBEE_WEBHOOK_SEGREDO;
  if (!esperado || !recebido) return false;
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Procura telefone e lead_id nos formatos que o Sevenbee usa por evento. */
function extrair(conteudo: Record<string, unknown> | null | undefined): {
  telefone?: string;
  leadId?: string;
} {
  if (!conteudo || typeof conteudo !== "object") return {};
  const contato =
    (conteudo.contact as Record<string, unknown> | undefined) ?? conteudo;
  const telefone =
    (typeof contato.phoneNumber === "string" && contato.phoneNumber) ||
    (typeof conteudo.phoneNumber === "string" && conteudo.phoneNumber) ||
    (typeof conteudo.contactPhoneNumber === "string" &&
      conteudo.contactPhoneNumber) ||
    undefined;
  const metadata =
    (contato.metadata as Record<string, unknown> | null | undefined) ??
    (conteudo.metadata as Record<string, unknown> | null | undefined);
  const leadId =
    metadata && typeof metadata.lead_id === "string"
      ? metadata.lead_id
      : undefined;
  return { telefone, leadId };
}

export async function POST(req: Request) {
  if (!process.env.SEVENBEE_WEBHOOK_SEGREDO) {
    return NextResponse.json(
      { erro: "Webhook não configurado." },
      { status: 503 },
    );
  }
  const segredo = new URL(req.url).searchParams.get("segredo");
  if (!segredoConfere(segredo)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let corpo: { eventType?: string; content?: Record<string, unknown> };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const status = STATUS_POR_EVENTO[corpo.eventType ?? ""];
  // Evento fora do funil (mensagens, contatos etc.): confirma e ignora.
  if (!status) return NextResponse.json({ ok: true, ignorado: true });

  const { telefone, leadId } = extrair(corpo.content);
  let atualizados = 0;
  try {
    atualizados = await atualizarAtendimento({ id: leadId, telefone, status });
  } catch (e) {
    console.error("[sevenbee-webhook] falha ao atualizar:", e);
  }
  if (!atualizados) {
    console.warn(
      `[sevenbee-webhook] ${corpo.eventType} sem lead correspondente`,
      { telefone: telefone ?? null, leadId: leadId ?? null },
    );
  }
  // Sempre 200: evita tempestade de reentregas do lado do Sevenbee.
  return NextResponse.json({ ok: true, atualizados });
}
