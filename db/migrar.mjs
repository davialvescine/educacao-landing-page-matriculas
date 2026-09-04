/**
 * Aplica db/schema.sql no banco apontado por DATABASE_URL.
 *
 *   DATABASE_URL="postgres://..." node db/migrar.mjs          # mostra o plano
 *   DATABASE_URL="postgres://..." node db/migrar.mjs --aplicar # executa
 *
 * O schema é aditivo e idempotente (CREATE TABLE IF NOT EXISTS,
 * ADD COLUMN IF NOT EXISTS): rodar de novo num banco já migrado não
 * altera nada nem apaga lead. Ainda assim o padrão é ensaio: só executa
 * com --aplicar, para ninguém rodar em produção por engano.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const aplicar = process.argv.includes("--aplicar");
const url = process.env.DATABASE_URL;

if (!url) {
  console.error("Defina DATABASE_URL. Ex.: DATABASE_URL=postgres://... node db/migrar.mjs");
  process.exit(1);
}

const raiz = path.dirname(fileURLToPath(import.meta.url));
const sql = await readFile(path.join(raiz, "schema.sql"), "utf8");

// Alvo, sem imprimir a senha.
const alvo = url.replace(/\/\/[^@]*@/, "//***@");
console.log(`banco:  ${alvo}`);
console.log(`modo:   ${aplicar ? "APLICAR" : "ensaio (nada será executado)"}`);

const cliente = new pg.Client({ connectionString: url });
try {
  await cliente.connect();
} catch (e) {
  console.error(`\nnão consegui conectar: ${e.message}`);
  console.error("Confira a DATABASE_URL, se o banco aceita conexão externa e se o IP está liberado.");
  process.exit(1);
}

async function retrato() {
  const { rows: tabelas } = await cliente.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  const { rows: colunas } = await cliente.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'leads' ORDER BY column_name`,
  );
  let leads = null;
  if (tabelas.some((t) => t.table_name === "leads")) {
    const { rows } = await cliente.query("SELECT count(*)::int AS n FROM leads");
    leads = rows[0].n;
  }
  return {
    tabelas: tabelas.map((t) => t.table_name),
    colunasLeads: colunas.map((c) => c.column_name),
    leads,
  };
}

const antes = await retrato();
console.log(`\ntabelas antes: ${antes.tabelas.join(", ") || "(nenhuma)"}`);
if (antes.leads !== null) console.log(`leads gravados: ${antes.leads}`);

const falta = {
  "tabela regioes_config": !antes.tabelas.includes("regioes_config"),
  "coluna leads.cidade":
    antes.colunasLeads.length > 0 && !antes.colunasLeads.includes("cidade"),
};
const pendentes = Object.entries(falta).filter(([, v]) => v).map(([k]) => k);
console.log(`\npendente: ${pendentes.length ? pendentes.join(", ") : "nada — banco já está atualizado"}`);

if (!aplicar) {
  console.log("\nEnsaio. Para executar de verdade, repita com --aplicar.");
  await cliente.end();
  process.exit(0);
}

try {
  await cliente.query("BEGIN");
  await cliente.query(sql);
  await cliente.query("COMMIT");
  console.log("\nschema aplicado.");
} catch (e) {
  await cliente.query("ROLLBACK");
  console.error("\nfalhou, nada foi alterado:", e.message);
  await cliente.end();
  process.exit(1);
}

const depois = await retrato();
console.log(`tabelas depois: ${depois.tabelas.join(", ")}`);
if (depois.leads !== null) console.log(`leads gravados: ${depois.leads} (antes: ${antes.leads})`);
await cliente.end();
