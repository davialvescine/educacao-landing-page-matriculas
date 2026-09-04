/**
 * Quem está do outro lado do socket.
 *
 * Não há login aqui: o painel já autentica com o Better Auth, e a sessão
 * dele mora na tabela `session`. Este serviço só confere o cookie contra
 * o banco. Assim não existe segredo compartilhado entre os dois
 * processos — se as chaves girarem, nada aqui precisa saber.
 */

/**
 * O Better Auth muda o nome do cookie conforme o protocolo: em https ele
 * ganha o prefixo `__Secure-`. Procurar só um dos nomes fazia o serviço
 * autenticar em desenvolvimento e recusar todo mundo em produção — falha
 * que se parece com "ninguém está usando" em vez de erro.
 */
const NOMES_COOKIE = [
  "__Secure-ea-painel.session_token",
  "ea-painel.session_token",
];

export function tokenDoCookie(cabecalho) {
  if (!cabecalho) return "";
  const achados = new Map();
  for (const parte of cabecalho.split(";")) {
    const [nome, ...resto] = parte.trim().split("=");
    if (!NOMES_COOKIE.includes(nome)) continue;
    // A assinatura vem depois do ponto; o token é o que se procura no
    // banco. Token inventado não existe na tabela, assinado ou não.
    achados.set(nome, decodeURIComponent(resto.join("=")).split(".")[0]);
  }
  // Preferência pelo cookie seguro quando os dois estiverem presentes.
  for (const nome of NOMES_COOKIE) {
    const t = achados.get(nome);
    if (t) return t;
  }
  return "";
}

/**
 * Devolve o usuário da sessão, ou null. Sessão vencida não vale: o banco
 * guarda a expiração e o painel não apaga a linha na hora.
 */
export async function usuarioDaSessao(pool, token) {
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.role, u.regioes, u.banned
       FROM session s JOIN "user" u ON u.id = s."userId"
      WHERE s.token = $1 AND s."expiresAt" > now()
      LIMIT 1`,
    [token],
  );
  const u = rows[0];
  if (!u || u.banned) return null;
  return {
    id: u.id,
    nome: u.name ?? "",
    admin: u.role === "admin",
    regioes: Array.isArray(u.regioes) ? u.regioes : [],
  };
}

/**
 * Admin vê tudo; coordenador vê só as regiões dele. Mesma regra do
 * painel, repetida aqui porque este processo não importa o código dele —
 * e regra de visibilidade duplicada é melhor que evento vazando.
 */
export function podeVer(usuario, estado) {
  if (!usuario) return false;
  if (usuario.admin) return true;
  return usuario.regioes.includes(estado);
}

/** A região de um lead, para autorizar antes de qualquer coisa. */
export async function regiaoDoLead(pool, leadId) {
  if (typeof leadId !== "string" || !/^[0-9a-f-]{36}$/i.test(leadId)) return null;
  const { rows } = await pool.query(`SELECT estado FROM leads WHERE id = $1`, [
    leadId,
  ]);
  return rows[0]?.estado ?? null;
}
