import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface LeadNovo {
  nome: string;
  whatsapp: string;
  email: string;
  estado: string;
  escola: string;
  nivel: string;
  /** Origem de campanha: utm_source, utm_medium, utm_campaign, gclid... */
  utm?: Record<string, string> | null;
}

export interface LeadRegistro extends LeadNovo {
  id: string;
  criado_em: string;
  webhook_status: string; // pendente | enviado | falhou:*
  webhook_tentativas: number;
  enviado_em: string | null;
  atendimento_status: string; // aguardando | em_atendimento | atendido
  atendimento_em: string | null;
}

/** Telefone reduzido a dígitos, sem o DDI 55, para casar lead × Sevenbee. */
export function normalizarTelefone(telefone: string): string {
  let d = telefone.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return d;
}

export interface FiltroLeads {
  estado?: string;
  status?: "pendente" | "enviado" | "falhou";
  limite?: number;
  /** Restringe às regiões do usuário (null/undefined = todas). */
  regioesPermitidas?: string[] | null;
}

// Pool do Postgres compartilhado; em dev sem DATABASE_URL usamos arquivo.
import { getPool } from "@/lib/db";

const ARQUIVO_DEV = path.join(process.cwd(), "var", "leads.jsonl");

export async function salvarLead(lead: LeadNovo): Promise<string> {
  const id = randomUUID();
  const db = getPool();
  if (db) {
    await db.query(
      `INSERT INTO leads (id, nome, whatsapp, email, estado, escola, nivel, utm)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        lead.nome,
        lead.whatsapp,
        lead.email,
        lead.estado,
        lead.escola,
        lead.nivel,
        lead.utm ? JSON.stringify(lead.utm) : null,
      ],
    );
  } else {
    await mkdir(path.dirname(ARQUIVO_DEV), { recursive: true });
    await appendFile(
      ARQUIVO_DEV,
      JSON.stringify({ id, ...lead, criado_em: new Date().toISOString() }) + "\n",
    );
  }
  return id;
}

export async function marcarWebhook(id: string, status: string): Promise<void> {
  const db = getPool();
  if (db) {
    await db.query(
      `UPDATE leads
       SET webhook_status = $2,
           webhook_tentativas = webhook_tentativas + 1,
           enviado_em = CASE WHEN $2 = 'enviado' THEN now() ELSE enviado_em END
       WHERE id = $1`,
      [id, status],
    );
    return;
  }
  // Arquivo é append-only: o status vira uma linha de atualização,
  // consolidada na leitura por lerArquivoDev().
  await mkdir(path.dirname(ARQUIVO_DEV), { recursive: true });
  await appendFile(
    ARQUIVO_DEV,
    JSON.stringify({ tipo: "webhook", id, status, em: new Date().toISOString() }) + "\n",
  );
}

async function lerArquivoDev(): Promise<LeadRegistro[]> {
  let bruto: string;
  try {
    bruto = await readFile(ARQUIVO_DEV, "utf8");
  } catch {
    return [];
  }
  const porId = new Map<string, LeadRegistro>();
  for (const linha of bruto.split("\n")) {
    if (!linha.trim()) continue;
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(linha);
    } catch {
      continue;
    }
    if (obj.tipo === "webhook") {
      const lead = porId.get(String(obj.id));
      if (lead) {
        lead.webhook_status = String(obj.status);
        lead.webhook_tentativas += 1;
        if (obj.status === "enviado") lead.enviado_em = String(obj.em);
      }
      continue;
    }
    if (obj.tipo === "atendimento") {
      const alvo = obj.id
        ? porId.get(String(obj.id))
        : [...porId.values()].find(
            (l) =>
              normalizarTelefone(l.whatsapp) ===
              normalizarTelefone(String(obj.telefone ?? "")),
          );
      if (alvo) {
        alvo.atendimento_status = String(obj.status);
        alvo.atendimento_em = String(obj.em);
      }
      continue;
    }
    porId.set(String(obj.id), {
      id: String(obj.id),
      nome: String(obj.nome ?? ""),
      whatsapp: String(obj.whatsapp ?? ""),
      email: String(obj.email ?? ""),
      estado: String(obj.estado ?? ""),
      escola: String(obj.escola ?? ""),
      nivel: String(obj.nivel ?? ""),
      criado_em: String(obj.criado_em ?? ""),
      webhook_status: "pendente",
      webhook_tentativas: 0,
      enviado_em: null,
      atendimento_status: "aguardando",
      atendimento_em: null,
      utm:
        obj.utm && typeof obj.utm === "object"
          ? (obj.utm as Record<string, string>)
          : null,
    });
  }
  return [...porId.values()].reverse(); // mais recentes primeiro
}

export async function listarLeads(filtro: FiltroLeads = {}): Promise<LeadRegistro[]> {
  const limite = Math.min(filtro.limite ?? 500, 2000);
  const db = getPool();
  if (db) {
    const clausulas: string[] = [];
    const valores: unknown[] = [];
    if (filtro.estado) {
      valores.push(filtro.estado);
      clausulas.push(`estado = $${valores.length}`);
    }
    if (filtro.status === "enviado") clausulas.push(`webhook_status = 'enviado'`);
    if (filtro.status === "pendente") clausulas.push(`webhook_status = 'pendente'`);
    if (filtro.status === "falhou") clausulas.push(`webhook_status LIKE 'falhou:%'`);
    if (filtro.regioesPermitidas) {
      if (!filtro.regioesPermitidas.length) return []; // sem região = sem leads
      valores.push(filtro.regioesPermitidas);
      clausulas.push(`estado = ANY($${valores.length})`);
    }
    valores.push(limite);
    const sql = `SELECT id, nome, whatsapp, email, estado, escola, nivel,
                        criado_em, webhook_status, webhook_tentativas, enviado_em,
                        atendimento_status, atendimento_em, utm
                 FROM leads
                 ${clausulas.length ? `WHERE ${clausulas.join(" AND ")}` : ""}
                 ORDER BY criado_em DESC
                 LIMIT $${valores.length}`;
    const { rows } = await db.query(sql, valores);
    return rows.map((r) => ({
      ...r,
      criado_em: new Date(r.criado_em).toISOString(),
      enviado_em: r.enviado_em ? new Date(r.enviado_em).toISOString() : null,
      atendimento_em: r.atendimento_em
        ? new Date(r.atendimento_em).toISOString()
        : null,
    }));
  }
  let leads = await lerArquivoDev();
  if (filtro.regioesPermitidas) {
    const permitidas = new Set(filtro.regioesPermitidas);
    leads = leads.filter((l) => permitidas.has(l.estado));
  }
  if (filtro.estado) leads = leads.filter((l) => l.estado === filtro.estado);
  if (filtro.status === "enviado")
    leads = leads.filter((l) => l.webhook_status === "enviado");
  if (filtro.status === "pendente")
    leads = leads.filter((l) => l.webhook_status === "pendente");
  if (filtro.status === "falhou")
    leads = leads.filter((l) => l.webhook_status.startsWith("falhou"));
  return leads.slice(0, limite);
}

export async function obterLead(id: string): Promise<LeadRegistro | null> {
  const db = getPool();
  if (db) {
    const { rows } = await db.query(
      `SELECT id, nome, whatsapp, email, estado, escola, nivel,
              criado_em, webhook_status, webhook_tentativas, enviado_em,
              atendimento_status, atendimento_em, utm
       FROM leads WHERE id = $1`,
      [id],
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      criado_em: new Date(rows[0].criado_em).toISOString(),
      enviado_em: rows[0].enviado_em
        ? new Date(rows[0].enviado_em).toISOString()
        : null,
      atendimento_em: rows[0].atendimento_em
        ? new Date(rows[0].atendimento_em).toISOString()
        : null,
    };
  }
  const leads = await lerArquivoDev();
  return leads.find((l) => l.id === id) ?? null;
}

/**
 * Atualiza o status de atendimento (eventos do Sevenbee). Casa pelo id do
 * lead quando disponível nos metadados do contato; senão, pelo telefone.
 * Retorna quantos leads foram atualizados.
 */
export async function atualizarAtendimento(opcoes: {
  id?: string;
  telefone?: string;
  status: "aguardando" | "em_atendimento" | "atendido";
}): Promise<number> {
  const { id, telefone, status } = opcoes;
  if (!id && !telefone) return 0;
  const db = getPool();
  if (db) {
    if (id) {
      const r = await db.query(
        `UPDATE leads SET atendimento_status = $2, atendimento_em = now() WHERE id = $1`,
        [id, status],
      );
      if (r.rowCount) return r.rowCount;
    }
    if (telefone) {
      const digitos = normalizarTelefone(telefone);
      if (!digitos) return 0;
      const r = await db.query(
        `UPDATE leads SET atendimento_status = $2, atendimento_em = now()
         WHERE regexp_replace(whatsapp, '[^0-9]', '', 'g') = $1
            OR regexp_replace(whatsapp, '[^0-9]', '', 'g') = '55' || $1`,
        [digitos, status],
      );
      return r.rowCount ?? 0;
    }
    return 0;
  }
  // Fallback em arquivo: linha de atualização consolidada na leitura.
  const leads = await lerArquivoDev();
  const alvo = id
    ? leads.find((l) => l.id === id)
    : leads.find(
        (l) =>
          normalizarTelefone(l.whatsapp) === normalizarTelefone(telefone ?? ""),
      );
  if (!alvo) return 0;
  await appendFile(
    ARQUIVO_DEV,
    JSON.stringify({
      tipo: "atendimento",
      id: alvo.id,
      status,
      em: new Date().toISOString(),
    }) + "\n",
  );
  return 1;
}

export interface ResumoLeads {
  total: number;
  hoje: number;
  enviados: number;
  pendentes: number;
  falhas: number;
  atendidos: number;
  porEstado: Record<string, number>;
}

export async function resumoLeads(
  regioesPermitidas?: string[] | null,
): Promise<ResumoLeads> {
  const leads = await listarLeads({ limite: 2000, regioesPermitidas });
  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);
  const resumo: ResumoLeads = {
    total: leads.length,
    hoje: 0,
    enviados: 0,
    pendentes: 0,
    falhas: 0,
    atendidos: 0,
    porEstado: {},
  };
  for (const l of leads) {
    if (new Date(l.criado_em) >= inicioHoje) resumo.hoje += 1;
    if (l.webhook_status === "enviado") resumo.enviados += 1;
    else if (l.webhook_status === "pendente") resumo.pendentes += 1;
    else resumo.falhas += 1;
    if (l.atendimento_status === "atendido") resumo.atendidos += 1;
    resumo.porEstado[l.estado] = (resumo.porEstado[l.estado] ?? 0) + 1;
  }
  return resumo;
}
