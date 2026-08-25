import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface LeadNovo {
  nome: string;
  whatsapp: string;
  email: string;
  estado: string;
  escola: string;
  nivel: string;
}

// Pool do Postgres criado sob demanda; em dev sem DATABASE_URL usamos arquivo.
type Pool = import("pg").Pool;
let pool: Pool | null = null;

function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool: PgPool } = require("pg") as typeof import("pg");
    pool = new PgPool({ connectionString: url, max: 5 });
  }
  return pool;
}

const ARQUIVO_DEV = path.join(process.cwd(), "var", "leads.jsonl");

export async function salvarLead(lead: LeadNovo): Promise<string> {
  const id = randomUUID();
  const db = getPool();
  if (db) {
    await db.query(
      `INSERT INTO leads (id, nome, whatsapp, email, estado, escola, nivel)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, lead.nome, lead.whatsapp, lead.email, lead.estado, lead.escola, lead.nivel],
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
  if (!db) return;
  await db.query(
    `UPDATE leads
     SET webhook_status = $2,
         webhook_tentativas = webhook_tentativas + 1,
         enviado_em = CASE WHEN $2 = 'enviado' THEN now() ELSE enviado_em END
     WHERE id = $1`,
    [id, status],
  );
}
