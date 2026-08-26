import { getEstado } from "@/lib/rede";
import { marcarWebhook, type LeadNovo } from "@/lib/leads";
import { enviarLeadSevenbee, sevenbeeConfigurado } from "@/lib/sevenbee";

export interface ResultadoWebhook {
  configurado: boolean;
  ok: boolean;
  status: string;
}

export function integracaoConfigurada(): boolean {
  return sevenbeeConfigurado() || Boolean(process.env.LEAD_WEBHOOK_URL);
}

/**
 * Envia um lead já salvo para o sistema externo e registra o resultado.
 * Preferência: Sevenbee (SEVENBEE_TOKEN); fallback: webhook genérico
 * (LEAD_WEBHOOK_URL). Usado no cadastro e no reenvio manual pelo painel.
 */
export async function enviarLeadWebhook(
  id: string,
  lead: LeadNovo,
): Promise<ResultadoWebhook> {
  if (sevenbeeConfigurado()) {
    const resultado = await enviarLeadSevenbee(id, lead);
    await marcarWebhook(id, resultado.status).catch(() => {});
    return { configurado: true, ok: resultado.ok, status: resultado.status };
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) return { configurado: false, ok: false, status: "pendente" };

  const estado = getEstado(lead.estado);
  let status: string;
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
        estado_nome: estado?.nome ?? lead.estado,
        associacao: estado?.associacao ?? "",
        origem: "landing-matriculas",
      }),
      signal: AbortSignal.timeout(8000),
    });
    status = res.ok ? "enviado" : `falhou:${res.status}`;
  } catch (e) {
    console.error("[leads] webhook falhou:", e);
    status = "falhou:erro-de-rede";
  }
  await marcarWebhook(id, status).catch(() => {});
  return { configurado: true, ok: status === "enviado", status };
}
