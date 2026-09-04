/**
 * Quem está do outro lado do socket.
 *
 * Não há login aqui: o painel já autentica com o Better Auth, e a sessão
 * dele mora na tabela `session`. Este serviço só confere o cookie contra
 * o banco. Assim não existe segredo compartilhado entre os dois processos
 * — se um dia as chaves girarem, nada aqui precisa saber.
 */

/** O cookie do Better Auth vem assinado: `token.assinatura`. */
const NOME_COOKIE = "ea-painel.session_token";

export function tokenDoCookie(cabecalho) {
  if (!cabecalho) return "";
  for (const parte of cabecalho.split(";")) {
    const [nome, ...resto] = parte.trim().split("=");
    if (nome !== NOME_COOKIE) continue;
    const valor = decodeURIComponent(resto.join("="));
    // A assinatura fica depois do ponto e é o Better Auth quem a valida.
    // Aqui basta o token, porque ele é procurado no banco: um token
    // inventado não existe na tabela, assinado ou não.
    return valor.split(".")[0];
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
