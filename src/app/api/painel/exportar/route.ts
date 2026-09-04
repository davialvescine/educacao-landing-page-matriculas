import { listarLeads } from "@/lib/leads";
import { nomeRegiao } from "@/lib/rede";
import { regioesPermitidas, usuarioLogado } from "@/lib/painel-auth";
import { origem, registrarAcesso } from "@/lib/usuarios";

export const runtime = "nodejs";

function celula(v: string): string {
  return `"${v.replaceAll('"', '""')}"`;
}

export async function GET(req: Request) {
  const usuario = await usuarioLogado();
  if (!usuario) {
    return new Response("Não autorizado.", { status: 401 });
  }
  const leads = await listarLeads({
    limite: 2000,
    regioesPermitidas: regioesPermitidas(usuario),
  });
  await registrarAcesso("exportou", {
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    detalhe: `${leads.length} leads`,
    ...origem(req),
  });
  const linhas = [
    [
      "data",
      "nome",
      "whatsapp",
      "email",
      "regiao",
      "cidade",
      "escola",
      "nivel",
      "status_envio",
      "tentativas",
      "enviado_em",
    ].join(";"),
    ...leads.map((l) =>
      [
        celula(l.criado_em),
        celula(l.nome),
        celula(l.whatsapp),
        celula(l.email),
        celula(nomeRegiao(l.estado)),
        celula(l.cidade),
        celula(l.escola),
        celula(l.nivel),
        celula(l.webhook_status),
        String(l.webhook_tentativas),
        celula(l.enviado_em ?? ""),
      ].join(";"),
    ),
  ];
  // BOM para o Excel abrir acentos corretamente.
  return new Response("﻿" + linhas.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-matriculas.csv"`,
    },
  });
}
