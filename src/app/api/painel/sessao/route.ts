import { NextResponse } from "next/server";
import {
  COOKIE_SESSAO,
  criarToken,
  DURACAO_SESSAO_S,
  painelConfigurado,
  senhaConfere,
} from "@/lib/painel-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!painelConfigurado()) {
    return NextResponse.json(
      { erro: "Painel não configurado. Defina PAINEL_SENHA no servidor." },
      { status: 503 },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }
  const senha = typeof body.senha === "string" ? body.senha : "";
  if (!senhaConfere(senha)) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESSAO, criarToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_S,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESSAO, "", { path: "/", maxAge: 0 });
  return res;
}
