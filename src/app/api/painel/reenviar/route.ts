import { NextResponse } from "next/server";
import { obterLead } from "@/lib/leads";
import { enviarLeadWebhook } from "@/lib/webhook";
import { regioesPermitidas, usuarioLogado } from "@/lib/painel-auth";
import { registrarAcesso } from "@/lib/usuarios";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const usuario = await usuarioLogado();
  if (!usuario) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const lead = id ? await obterLead(id) : null;
  if (!lead) {
    return NextResponse.json({ erro: "Lead não encontrado." }, { status: 404 });
  }
  const permitidas = regioesPermitidas(usuario);
  if (permitidas && !permitidas.includes(lead.estado)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }
  await registrarAcesso("reenviou", {
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    detalhe: `${lead.nome} (${lead.estado})`,
  });
  const resultado = await enviarLeadWebhook(lead.id, {
    nome: lead.nome,
    whatsapp: lead.whatsapp,
    email: lead.email,
    estado: lead.estado,
    escola: lead.escola,
    nivel: lead.nivel,
  });
  if (!resultado.configurado) {
    return NextResponse.json(
      { erro: "Integração não configurada. Defina SEVENBEE_TOKEN." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: resultado.ok, status: resultado.status });
}
