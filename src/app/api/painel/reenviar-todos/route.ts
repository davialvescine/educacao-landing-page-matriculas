import { NextResponse } from "next/server";
import { exigirPapel } from "@/lib/painel-auth";
import { registrarAcesso } from "@/lib/usuarios";
import { reenviarFalhas } from "@/lib/reprocesso";
import { integracaoConfigurada } from "@/lib/webhook";

export const runtime = "nodejs";

/** Botão "Reenviar todos" do painel: reprocessa falhas e pendentes. */
export async function POST() {
  const usuario = await exigirPapel("admin");
  if (!usuario) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  if (!integracaoConfigurada()) {
    return NextResponse.json(
      { erro: "Integração não configurada. Defina SEVENBEE_TOKEN." },
      { status: 503 },
    );
  }
  await registrarAcesso("reenviou", {
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    detalhe: "reprocessamento em massa",
  });
  const resultado = await reenviarFalhas();
  return NextResponse.json({ ok: true, ...resultado });
}
