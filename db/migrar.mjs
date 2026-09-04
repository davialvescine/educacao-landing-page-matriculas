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
  const { rows: objetos } = await cliente.query(
    `SELECT 'indice:' || indexname AS nome FROM pg_indexes WHERE schemaname = 'public'
     UNION ALL
     SELECT 'gatilho:' || tgname FROM pg_trigger WHERE NOT tgisinternal
     UNION ALL
     SELECT 'funcao:' || proname FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'`,
  );
  const { rows: colunas } = await cliente.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public' ORDER BY table_name, column_name`,
  );
  let leads = null;
  if (tabelas.some((t) => t.table_name === "leads")) {
    const { rows } = await cliente.query("SELECT count(*)::int AS n FROM leads");
    leads = rows[0].n;
  }
  return {
    tabelas: tabelas.map((t) => t.table_name),
    colunas: new Set(colunas.map((c) => `${c.table_name}.${c.column_name}`)),
    objetos: new Set(objetos.map((o) => o.nome)),
    leads,
  };
}

const antes = await retrato();
console.log(`\ntabelas antes: ${antes.tabelas.join(", ") || "(nenhuma)"}`);
if (antes.leads !== null) console.log(`leads gravados: ${antes.leads}`);

// O que o schema atual espera encontrar. Cada linha nova de ALTER TABLE
// em db/schema.sql entra aqui, senão o ensaio diz "nada pendente" para um
// banco que na verdade está atrasado — e foi assim que a checagem anterior
// envelheceu sem ninguém perceber.
const EXIGE_TABELA = ["leads", "acessos", "regioes_config", "consentimentos"];
const EXIGE_COLUNA = [
  "leads.cidade",
  "leads.utm",
  "leads.atendimento_status",
  "leads.atendente_id",
  "leads.atendente_nome",
  "acessos.ip",
  "acessos.agente",
  "consentimentos.metodo",
];

// Índice, gatilho e função também envelhecem: a checagem só de tabela e
// coluna dizia "atualizado" para banco sem o gatilho de aviso, e aí o
// tempo real ficava mudo sem ninguém entender por quê.
const EXIGE_OBJETO = [
  "indice:acessos_acao_idx",
  "indice:acessos_criado_em_idx",
  "indice:consentimentos_lead_idx",
  "gatilho:leads_avisar_trg",
  "funcao:leads_avisar",
];

const pendentes = [
  ...EXIGE_TABELA.filter((t) => !antes.tabelas.includes(t)).map(
    (t) => `tabela ${t}`,
  ),
  // Coluna só falta se a tabela existe: tabela ausente já foi contada acima.
  ...EXIGE_COLUNA.filter((c) => {
    const tabela = c.split(".")[0];
    return antes.tabelas.includes(tabela) && !antes.colunas.has(c);
  }).map((c) => `coluna ${c}`),
  ...EXIGE_OBJETO.filter((o) => !antes.objetos.has(o)),
];
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
