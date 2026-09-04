import "server-only";
import { getPool } from "@/lib/db";

/**
 * WhatsApp por região, sobrescrito pela coordenação no painel.
 *
 * A base continua em src/data/rede.json. Esta camada só guarda o que foi
 * editado: região sem linha na tabela segue usando o número do arquivo.
 *
 * As páginas do site são estáticas. Quem faz o número novo aparecer é o
 * revalidatePath() disparado no salvamento, não uma consulta por visita:
 * o visitante recebe HTML pronto, sem tocar no banco.
 */

export interface WhatsappRegiao {
  numero: string;
  link: string;
}

/** Só dígitos, com o 55 na frente — formato que o wa.me espera. */
export function linkWhatsapp(numero: string): string | null {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  const comDdi = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${comDdi}`;
}

/**
 * O que a coordenação sobrescreveu, por slug interno de região.
 * Falha de banco devolve vazio: o site cai no rede.json em vez de quebrar.
 */
export async function getWhatsappSobrescritos(): Promise<
  Record<string, WhatsappRegiao>
> {
  const db = getPool();
  if (!db) return {};

  try {
    const { rows } = await db.query<{ slug: string; whatsapp_numero: string }>(
      `SELECT slug, whatsapp_numero FROM regioes_config WHERE whatsapp_numero <> ''`,
    );
    const saida: Record<string, WhatsappRegiao> = {};
    for (const r of rows) {
      const link = linkWhatsapp(r.whatsapp_numero);
      if (link) saida[r.slug] = { numero: r.whatsapp_numero, link };
    }
    return saida;
  } catch (e) {
    console.error("[regioes] falha ao ler whatsapp:", e);
    return {};
  }
}

/** Grava o número de uma região. String vazia volta para o valor do arquivo. */
export async function salvarWhatsappRegiao(
  slug: string,
  numero: string,
  usuario: string,
): Promise<void> {
  const db = getPool();
  if (!db) throw new Error("Banco não configurado.");

  await db.query(
    `INSERT INTO regioes_config (slug, whatsapp_numero, atualizado_em, atualizado_por)
     VALUES ($1, $2, now(), $3)
     ON CONFLICT (slug) DO UPDATE
       SET whatsapp_numero = EXCLUDED.whatsapp_numero,
           atualizado_em   = now(),
           atualizado_por  = EXCLUDED.atualizado_por`,
    [slug, numero.trim(), usuario],
  );
}

/** Quem mexeu e quando, para a tela do painel mostrar. */
export async function getHistoricoWhatsapp(): Promise<
  Record<string, { atualizado_em: string; atualizado_por: string }>
> {
  const db = getPool();
  if (!db) return {};
  try {
    const { rows } = await db.query<{
      slug: string;
      atualizado_em: Date;
      atualizado_por: string;
    }>(`SELECT slug, atualizado_em, atualizado_por FROM regioes_config`);
    return Object.fromEntries(
      rows.map((r) => [
        r.slug,
        {
          atualizado_em: r.atualizado_em.toISOString(),
          atualizado_por: r.atualizado_por,
        },
      ]),
    );
  } catch {
    return {};
  }
}
