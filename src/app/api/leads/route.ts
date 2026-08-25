import { NextResponse } from "next/server";
import { getEstado } from "@/lib/rede";
import { salvarLead, marcarWebhook, type LeadNovo } from "@/lib/leads";

export const runtime = "nodejs";

function limpar(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const lead: LeadNovo = {
    nome: limpar(body.nome, 120),
    whatsapp: limpar(body.whatsapp, 20),
    email: limpar(body.email, 160),
    estado: limpar(body.estado, 40),
    escola: limpar(body.escola, 120),
    nivel: limpar(body.nivel, 60),
  };

  if (!lead.nome || !lead.whatsapp) {
    return NextResponse.json(
      { erro: "Informe nome e WhatsApp." },
      { status: 400 },
    );
  }
  const estado = getEstado(lead.estado);
  if (!estado) {
    return NextResponse.json({ erro: "Selecione a região." }, { status: 400 });
  }
  const digitos = lead.whatsapp.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 13) {
    return NextResponse.json(
      { erro: "Informe um WhatsApp válido com DDD." },
      { status: 400 },
    );
  }

  let id: string;
  try {
    id = await salvarLead(lead);
  } catch (e) {
    console.error("[leads] falha ao salvar:", e);
    return NextResponse.json(
      { erro: "Não foi possível registrar. Tente novamente." },
      { status: 500 },
    );
  }

  // Dispara para o sistema externo depois de salvar: lead nunca se perde.
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.LEAD_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          id,
          ...lead,
          estado_nome: estado.nome,
          associacao: estado.associacao,
          origem: "landing-matriculas",
        }),
        signal: AbortSignal.timeout(8000),
      });
      await marcarWebhook(id, res.ok ? "enviado" : `falhou:${res.status}`);
    } catch (e) {
      console.error("[leads] webhook falhou:", e);
      await marcarWebhook(id, "falhou:erro-de-rede").catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, id });
}
