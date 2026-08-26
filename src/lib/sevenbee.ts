import type { LeadNovo } from "@/lib/leads";
import { getRegiaoLead } from "@/lib/rede";

/**
 * Integração com o Sevenbee (https://sevenbee.readme.io).
 * O lead vira um contato via POST /core/v1/contact com upsert por telefone:
 * se a família já existe na base, os dados são atualizados em vez de duplicar.
 * Limites da API: 1.000 req / 5 min por conta, muito acima do nosso volume.
 */

const SEVENBEE_API = "https://api.app.sevenbee.com.br/core";

export function sevenbeeConfigurado(): boolean {
  return Boolean(process.env.SEVENBEE_TOKEN);
}

/** Telefone no formato internacional que o Sevenbee espera (55 + DDD + número). */
function telefoneInternacional(whatsapp: string): string {
  const digitos = whatsapp.replace(/\D/g, "");
  return digitos.startsWith("55") && digitos.length >= 12
    ? digitos
    : `55${digitos}`;
}

export interface EnvioSevenbee {
  ok: boolean;
  status: string; // enviado | falhou:*
  contatoId?: string;
}

export async function enviarLeadSevenbee(
  id: string,
  lead: LeadNovo,
): Promise<EnvioSevenbee> {
  const token = process.env.SEVENBEE_TOKEN;
  if (!token) return { ok: false, status: "pendente" };

  const estado = getRegiaoLead(lead.estado);
  const tagBase = process.env.SEVENBEE_TAG ?? "Matrículas 2027";
  const origem = lead.utm
    ? [lead.utm.utm_source, lead.utm.utm_medium, lead.utm.utm_campaign]
        .filter(Boolean)
        .join(" / ")
    : "";
  const anotacao = [
    `Lead da landing de matrículas (${new Date().toLocaleDateString("pt-BR")}).`,
    estado ? `Região: ${estado.nome} (${estado.associacao})` : null,
    lead.escola ? `Escola de interesse: ${lead.escola}` : null,
    lead.nivel ? `Série / nível: ${lead.nivel}` : null,
    origem ? `Campanha: ${origem}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`${SEVENBEE_API}/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: lead.nome,
        phoneNumber: telefoneInternacional(lead.whatsapp),
        email: lead.email || null,
        annotation: anotacao,
        tagNames: [tagBase, estado?.nome ?? lead.estado].filter(Boolean),
        metadata: {
          origem: "landing-matriculas",
          lead_id: id,
          regiao: lead.estado,
          regiao_nome: estado?.nome ?? lead.estado,
          associacao: estado?.associacao ?? "",
          escola: lead.escola,
          nivel: lead.nivel,
          ...(lead.utm ?? {}),
        },
        options: { upsert: true },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const corpo = await res.text().catch(() => "");
      console.error(`[sevenbee] HTTP ${res.status}:`, corpo.slice(0, 300));
      return { ok: false, status: `falhou:${res.status}` };
    }
    const contato = (await res.json().catch(() => null)) as {
      id?: string;
    } | null;
    return { ok: true, status: "enviado", contatoId: contato?.id };
  } catch (e) {
    console.error("[sevenbee] envio falhou:", e);
    return { ok: false, status: "falhou:erro-de-rede" };
  }
}
