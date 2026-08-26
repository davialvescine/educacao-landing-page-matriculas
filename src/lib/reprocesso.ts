import { listarLeads } from "@/lib/leads";
import { enviarLeadWebhook, integracaoConfigurada } from "@/lib/webhook";

export interface ResultadoReprocesso {
  processados: number;
  enviados: number;
  falhas: number;
}

/**
 * Reprocessa leads que ainda não chegaram ao sistema externo
 * (falhou:* e pendentes). Usado pelo botão "Reenviar todos" do painel
 * e pela tarefa agendada (/api/tarefas/reenviar-falhas).
 */
export async function reenviarFalhas(limite = 100): Promise<ResultadoReprocesso> {
  const resultado: ResultadoReprocesso = {
    processados: 0,
    enviados: 0,
    falhas: 0,
  };
  if (!integracaoConfigurada()) return resultado;

  const [falharam, pendentes] = await Promise.all([
    listarLeads({ status: "falhou", limite }),
    listarLeads({ status: "pendente", limite }),
  ]);
  const fila = [...falharam, ...pendentes].slice(0, limite);

  for (const lead of fila) {
    resultado.processados += 1;
    const r = await enviarLeadWebhook(lead.id, {
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      email: lead.email,
      estado: lead.estado,
      escola: lead.escola,
      nivel: lead.nivel,
      utm: lead.utm ?? null,
    });
    if (r.ok) resultado.enviados += 1;
    else resultado.falhas += 1;
  }
  return resultado;
}
