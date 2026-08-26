import { NextResponse } from "next/server";
import { sessaoValida } from "@/lib/painel-auth";
import { reenviarFalhas } from "@/lib/reprocesso";
import { integracaoConfigurada } from "@/lib/webhook";

export const runtime = "nodejs";

/** Botão "Reenviar todos" do painel: reprocessa falhas e pendentes. */
export async function POST() {
  if (!(await sessaoValida())) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  if (!integracaoConfigurada()) {
    return NextResponse.json(
      { erro: "Integração não configurada. Defina SEVENBEE_TOKEN." },
      { status: 503 },
    );
  }
  const resultado = await reenviarFalhas();
  return NextResponse.json({ ok: true, ...resultado });
}
