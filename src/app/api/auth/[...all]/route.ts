import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { origem, registrarAcesso } from "@/lib/usuarios";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

/**
 * Cadastro público bloqueado: contas são criadas por um administrador
 * dentro do painel (ou pelo primeiro acesso, que roda no servidor).
 */
export async function POST(req: Request) {
  const rota = new URL(req.url).pathname;

  if (rota.endsWith("/sign-up/email")) {
    return new Response(
      JSON.stringify({ message: "Cadastro indisponível.", code: "SIGN_UP_DISABLED" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  if (rota.endsWith("/sign-in/email")) return entrar(req);

  return handler.POST(req);
}

/**
 * Entrada no painel, registrada dos dois lados.
 *
 * As demais ações da trilha são gravadas por quem as executa. O login não
 * tem "quem": quando a tentativa falha, não existe usuário logado para
 * pedir contexto — e é justamente a tentativa que falha o sinal que
 * importa. Trinta erros no mesmo e-mail em dois minutos é alguém testando
 * senha, e sem este registro isso passa invisível.
 *
 * Por que aqui e não num hook do Better Auth: o hook de sessão só dispara
 * quando a entrada dá certo. O que interessa é o par.
 */
async function entrar(req: Request): Promise<Response> {
  // O corpo só pode ser lido uma vez; a cópia é para o handler original.
  const tentado = await emailTentado(req.clone());
  const resposta = await handler.POST(req);
  const de = origem(req);

  if (resposta.ok) {
    const dados = await resposta
      .clone()
      .json()
      .catch(() => null);
    const usuario = (dados as { user?: { id?: string; name?: string } } | null)?.user;
    await registrarAcesso("login", {
      usuarioId: usuario?.id,
      usuarioNome: usuario?.name ?? tentado,
      ...de,
    });
  } else {
    // O e-mail digitado é o que identifica a tentativa. A senha não entra
    // aqui de forma alguma: quem erra o campo digita a senha no lugar do
    // e-mail com frequência suficiente para isso virar vazamento.
    await registrarAcesso("login_falhou", {
      usuarioNome: tentado,
      detalhe: `e-mail ou senha inválidos (${resposta.status})`,
      ...de,
    });
  }

  return resposta;
}

/** E-mail digitado na tentativa, ou vazio se o corpo não vier legível. */
async function emailTentado(req: Request): Promise<string> {
  try {
    const corpo = await req.json();
    const email = (corpo as { email?: unknown })?.email;
    return typeof email === "string" ? email.trim().slice(0, 120) : "";
  } catch {
    return "";
  }
}
