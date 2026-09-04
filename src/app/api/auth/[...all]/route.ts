import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { origem, registrarAcesso, type AcaoAcesso } from "@/lib/usuarios";

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
    anotar("login", {
      usuarioId: usuario?.id,
      usuarioNome: usuario?.name ?? tentado,
      ...de,
    });
  } else if (resposta.status >= 500) {
    // Banco fora do ar não é tentativa de invasão. Marcar 500 como senha
    // errada faria uma indisponibilidade parecer ataque de força bruta,
    // exatamente quando alguém está olhando a trilha para entender o que
    // está acontecendo.
    anotar("login_erro", {
      usuarioNome: tentado,
      detalhe: `falha do servidor (${resposta.status})`,
      ...de,
    });
  } else {
    anotar("login_falhou", {
      usuarioNome: tentado,
      detalhe: `e-mail ou senha inválidos (${resposta.status})`,
      ...de,
    });
  }

  return resposta;
}

/**
 * Registra sem segurar a resposta.
 *
 * O `await` aqui punha a auditoria no caminho crítico do login: pool
 * saturado ou lock deixavam a tela girando com a sessão já criada. A
 * gravação não pode custar a entrada de ninguém, então ela solta e o
 * erro fica no log do servidor.
 */
function anotar(acao: AcaoAcesso, opcoes: Parameters<typeof registrarAcesso>[1]) {
  void registrarAcesso(acao, opcoes).catch(() => {});
}

/**
 * E-mail digitado na tentativa — e só se for mesmo um e-mail.
 *
 * Quem troca os campos digita a SENHA aqui. Gravar o conteúdo cru
 * colocaria a senha em texto claro na trilha de auditoria, visível para
 * qualquer administrador. O que não parece e-mail vira uma marca sem
 * conteúdo: ainda dá para contar as tentativas, sem guardar o segredo.
 */
const PARECE_EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

async function emailTentado(req: Request): Promise<string> {
  try {
    const corpo = await req.json();
    const email = (corpo as { email?: unknown })?.email;
    if (typeof email !== "string") return "";
    const limpo = email.trim().slice(0, 120);
    return PARECE_EMAIL.test(limpo) ? limpo : "(não é um e-mail)";
  } catch {
    return "";
  }
}
