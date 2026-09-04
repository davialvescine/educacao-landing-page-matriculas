import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { autenticacaoConfigurada, existeAdmin } from "@/lib/painel-auth";
import { origem, registrarAcesso } from "@/lib/usuarios";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Cria o primeiro administrador do painel. Só funciona enquanto não existe
 * nenhum admin; depois disso, as contas são criadas dentro do painel.
 *
 * Usa o adaptador interno do Better Auth porque `signUpEmail` respeita o
 * `disableSignUp` mesmo em chamadas do servidor. Depois de criado, o cliente
 * faz login normalmente.
 */
export async function POST(req: Request) {
  if (!autenticacaoConfigurada()) {
    return NextResponse.json(
      { erro: "Painel não configurado no servidor." },
      { status: 503 },
    );
  }
  if (await existeAdmin()) {
    return NextResponse.json(
      { erro: "O painel já tem administrador. Peça um acesso a ele." },
      { status: 409 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body.senha === "string" ? body.senha : "";

  if (!nome || !email.includes("@")) {
    return NextResponse.json(
      { erro: "Informe seu nome e um e-mail válido." },
      { status: 400 },
    );
  }
  if (senha.length < 8) {
    return NextResponse.json(
      { erro: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  try {
    // Chamada no servidor: não passa pelo bloqueio da rota pública.
    await auth.api.signUpEmail({
      body: { name: nome, email, password: senha },
    });

    // Promove a administrador e guarda as regiões (ainda não há admin
    // logado para autorizar o setRole pela API).
    const db = getPool();
    if (db) {
      await db.query(
        `UPDATE "user" SET role = 'admin', regioes = '[]'::jsonb WHERE lower(email) = lower($1)`,
        [email],
      );
    }

    await registrarAcesso("criou_usuario", {
      usuarioNome: nome,
      detalhe: "primeiro administrador do painel",
      ...origem(req),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[primeiro-acesso]", e);
    return NextResponse.json(
      { erro: "Não foi possível criar o acesso." },
      { status: 500 },
    );
  }
}
