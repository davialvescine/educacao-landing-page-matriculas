import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { reenviarFalhas } from "@/lib/reprocesso";

export const runtime = "nodejs";

/**
 * Tarefa agendada: reenvia leads que falharam ao ir para o Sevenbee.
 * Agende no Coolify (Scheduled Tasks) ou em qualquer cron:
 *   curl -fsS "https://<dominio>/api/tarefas/reenviar-falhas?segredo=<CRON_SEGREDO>"
 */

function autorizado(segredo: string | null): boolean {
  const esperado = process.env.CRON_SEGREDO;
  if (!esperado || !segredo) return false;
  const a = Buffer.from(segredo, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!process.env.CRON_SEGREDO) {
    return NextResponse.json(
      { erro: "Tarefa não configurada. Defina CRON_SEGREDO." },
      { status: 503 },
    );
  }
  if (!autorizado(new URL(req.url).searchParams.get("segredo"))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  const resultado = await reenviarFalhas();
  return NextResponse.json({ ok: true, ...resultado });
}

export const POST = GET;
