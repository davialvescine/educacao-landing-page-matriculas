import { listarLeads } from "@/lib/leads";
import { nomeRegiao } from "@/lib/rede";
import { sessaoValida } from "@/lib/painel-auth";

export const runtime = "nodejs";

function celula(v: string): string {
  return `"${v.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!(await sessaoValida())) {
    return new Response("Não autorizado.", { status: 401 });
  }
  const leads = await listarLeads({ limite: 2000 });
  const linhas = [
    [
      "data",
      "nome",
      "whatsapp",
      "email",
      "regiao",
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
