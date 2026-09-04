import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { exigirPapel } from "@/lib/painel-auth";
import { origem, registrarAcesso } from "@/lib/usuarios";
import { getEstados } from "@/lib/rede";

export const runtime = "nodejs";

const REGIOES_VALIDAS = new Set([...getEstados().map((e) => e.slug), "iabc"]);

function limparRegioes(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is string => typeof r === "string")
    .filter((r) => REGIOES_VALIDAS.has(r));
}

function mensagemErro(e: unknown, padrao: string): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/already exists|duplicate|unique/i.test(msg)) {
    return "Já existe um usuário com esse e-mail.";
  }
  console.error("[usuarios]", e);
  return padrao;
}

/** Lista a equipe do painel. */
export async function GET() {
  if (!(await exigirPapel("admin"))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  try {
    const r = await auth.api.listUsers({
      query: { limit: 200, sortBy: "name", sortDirection: "asc" },
      headers: await headers(),
    });
    const lista = (r as { users?: unknown[] }).users ?? [];
    return NextResponse.json({
      usuarios: lista.map((u) => {
        const usuario = u as Record<string, unknown>;
        return {
          id: String(usuario.id),
          nome: String(usuario.name ?? ""),
          email: String(usuario.email ?? ""),
          papel: usuario.role === "admin" ? "admin" : "coordenador",
          regioes: Array.isArray(usuario.regioes) ? usuario.regioes : [],
          ativo: usuario.banned !== true,
          criado_em: usuario.createdAt
            ? new Date(usuario.createdAt as string).toISOString()
            : null,
        };
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemErro(e, "Não foi possível listar a equipe.") },
      { status: 500 },
    );
  }
}

/** Cria um usuário da equipe. */
export async function POST(req: Request) {
  const admin = await exigirPapel("admin");
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const senha = typeof body.senha === "string" ? body.senha : "";
  const papel = body.papel === "admin" ? "admin" : "coordenador";
  // No banco o coordenador é "user" (nome do plugin admin).
  const papelInterno = papel === "admin" ? "admin" : "user";
  const regioes = papel === "admin" ? [] : limparRegioes(body.regioes);

  if (!nome || !email.includes("@")) {
    return NextResponse.json(
      { erro: "Informe o nome e um e-mail válido." },
      { status: 400 },
    );
  }
  if (senha.length < 8) {
    return NextResponse.json(
      { erro: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }
  if (papel === "coordenador" && !regioes.length) {
    return NextResponse.json(
      { erro: "Escolha ao menos uma região para o coordenador." },
      { status: 400 },
    );
  }

  try {
    await auth.api.createUser({
      body: {
        name: nome,
        email,
        password: senha,
        role: papelInterno,
        data: { regioes },
      },
      headers: await headers(),
    });
    await registrarAcesso("criou_usuario", {
      usuarioId: admin.id,
      usuarioNome: admin.nome,
      detalhe: `${nome} como ${papel}`,
      ...origem(req),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemErro(e, "Não foi possível criar o usuário.") },
      { status: 400 },
    );
  }
}

/** Atualiza papel, regiões, senha ou acesso de um usuário. */
export async function PATCH(req: Request) {
  const admin = await exigirPapel("admin");
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ erro: "Usuário inválido." }, { status: 400 });
  }
  // Ninguém tira o próprio acesso de administrador: evita painel órfão.
  if (
    id === admin.id &&
    (body.ativo === false || body.papel === "coordenador")
  ) {
    return NextResponse.json(
      { erro: "Você não pode remover o próprio acesso de administrador." },
      { status: 400 },
    );
  }

  const cabecalhos = await headers();

  // Nome de quem está sendo alterado: o registro guarda gente, não códigos.
  let alvo = "usuário";
  try {
    const lista = await auth.api.listUsers({
      query: { limit: 200 },
      headers: cabecalhos,
    });
    const achado = ((lista as { users?: unknown[] }).users ?? []).find(
      (u) => (u as { id?: string }).id === id,
    ) as { name?: string } | undefined;
    if (achado?.name) alvo = achado.name;
  } catch {
    // sem o nome, segue com o rótulo genérico
  }

  const feito: string[] = [];
  try {
    if (body.papel === "admin" || body.papel === "coordenador") {
      await auth.api.setRole({
        body: {
          userId: id,
          role: body.papel === "admin" ? "admin" : "user",
        },
        headers: cabecalhos,
      });
      feito.push(`papel: ${body.papel}`);
    }
    if (typeof body.nome === "string" || Array.isArray(body.regioes)) {
      const dados: Record<string, unknown> = {};
      if (typeof body.nome === "string" && body.nome.trim()) {
        dados.name = body.nome.trim();
      }
      if (Array.isArray(body.regioes)) {
        dados.regioes = limparRegioes(body.regioes);
      }
      if (Object.keys(dados).length) {
        await auth.api.adminUpdateUser({
          body: { userId: id, data: dados },
          headers: cabecalhos,
        });
        feito.push("dados");
      }
    }
    if (typeof body.senha === "string" && body.senha) {
      if (body.senha.length < 8) {
        return NextResponse.json(
          { erro: "A senha precisa ter pelo menos 8 caracteres." },
          { status: 400 },
        );
      }
      await auth.api.setUserPassword({
        body: { userId: id, newPassword: body.senha },
        headers: cabecalhos,
      });
      feito.push("senha");
    }
    if (typeof body.ativo === "boolean") {
      if (body.ativo) {
        await auth.api.unbanUser({ body: { userId: id }, headers: cabecalhos });
        feito.push("reativado");
      } else {
        await auth.api.banUser({
          body: { userId: id, banReason: "Acesso desativado pelo administrador" },
          headers: cabecalhos,
        });
        feito.push("desativado");
      }
    }
  } catch (e) {
    return NextResponse.json(
      { erro: mensagemErro(e, "Não foi possível atualizar o usuário.") },
      { status: 400 },
    );
  }

  if (!feito.length) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 400 });
  }
  await registrarAcesso("alterou_usuario", {
    usuarioId: admin.id,
    usuarioNome: admin.nome,
    detalhe: `${alvo}: ${feito.join(", ")}`,
    ...origem(req),
  });
  return NextResponse.json({ ok: true });
}
