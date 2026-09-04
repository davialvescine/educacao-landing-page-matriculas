import "server-only";
import { createHash } from "node:crypto";
import { getPool } from "@/lib/db";
import { getVersao } from "@/lib/consentimento";

/**
 * Gravação e leitura da prova de consentimento.
 *
 * O texto não vem do navegador: o servidor busca pela versão no próprio
 * código. Aceitar o texto que o cliente mandou permitiria a qualquer um
 * forjar a prova, que é justamente o que ela existe para impedir.
 */

export interface RegistroConsentimento {
  versao: string;
  texto: string;
  aceito_em: string;
  ip: string;
  intacto: boolean;
}

function resumo(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

/** Primeiro IP da cadeia de proxies, que é o do visitante. */
export function ipDaRequisicao(req: Request): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim().slice(0, 45);
  return req.headers.get("cf-connecting-ip")?.slice(0, 45) ?? "";
}

export async function registrarConsentimento(dados: {
  leadId: string;
  versao: string;
  ip: string;
  agente: string;
}): Promise<void> {
  const versao = getVersao(dados.versao);
  if (!versao) throw new Error(`Versão de consentimento desconhecida: ${dados.versao}`);

  const db = getPool();
  if (!db) {
    // Em dev sem banco o lead já cai em arquivo; o consentimento acompanha.
    console.warn("[consentimento] sem banco: registro não persistido.");
    return;
  }

  await db.query(
    `INSERT INTO consentimentos (lead_id, versao, texto_hash, ip, agente)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      dados.leadId,
      versao.versao,
      resumo(versao.texto),
      dados.ip,
      dados.agente.slice(0, 300),
    ],
  );
}

/** O que a família aceitou, para o painel mostrar e a rede se defender. */
export async function getConsentimento(
  leadId: string,
): Promise<RegistroConsentimento | null> {
  const db = getPool();
  if (!db) return null;
  try {
    const { rows } = await db.query<{
      versao: string;
      texto_hash: string;
      aceito_em: Date;
      ip: string;
    }>(
      `SELECT versao, texto_hash, aceito_em, ip
       FROM consentimentos WHERE lead_id = $1
       ORDER BY aceito_em DESC LIMIT 1`,
      [leadId],
    );
    const r = rows[0];
    if (!r) return null;
    const versao = getVersao(r.versao);
    return {
      versao: r.versao,
      texto: versao?.texto ?? "(texto desta versão não está mais no código)",
      aceito_em: r.aceito_em.toISOString(),
      ip: r.ip,
      // Se o resumo não bate, o texto da versão foi editado depois do
      // aceite — e a prova daquele consentimento não vale mais.
      intacto: versao ? resumo(versao.texto) === r.texto_hash : false,
    };
  } catch (e) {
    console.error("[consentimento] falha ao ler:", e);
    return null;
  }
}
