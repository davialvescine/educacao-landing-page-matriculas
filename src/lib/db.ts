/** Pool do Postgres compartilhado. Sem DATABASE_URL (dev), retorna null
 *  e cada módulo usa seu fallback em arquivo. */
type Pool = import("pg").Pool;
let pool: Pool | null = null;

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool: PgPool } = require("pg") as typeof import("pg");
    pool = new PgPool({ connectionString: url, max: 5 });
  }
  return pool;
}
