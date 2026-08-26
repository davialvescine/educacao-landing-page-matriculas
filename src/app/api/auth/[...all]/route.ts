import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

/**
 * Cadastro público bloqueado: contas são criadas por um administrador
 * dentro do painel (ou pelo primeiro acesso, que roda no servidor).
 */
export async function POST(req: Request) {
  if (new URL(req.url).pathname.endsWith("/sign-up/email")) {
    return new Response(
      JSON.stringify({ message: "Cadastro indisponível.", code: "SIGN_UP_DISABLED" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }
  return handler.POST(req);
}
