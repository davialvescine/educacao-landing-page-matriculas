import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Camada fina sobre o Better Auth com as regras do painel:
 * papel (admin/coordenador) e quais regiões cada pessoa enxerga.
 */

export type Papel = "admin" | "coordenador";

export interface UsuarioPainel {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  regioes: string[];
}

export function autenticacaoConfigurada(): boolean {
  return Boolean(process.env.BETTER_AUTH_SECRET && process.env.DATABASE_URL);
}

/** Usuário da sessão atual, ou null. Banido conta como sem acesso. */
export async function usuarioLogado(): Promise<UsuarioPainel | null> {
  if (!autenticacaoConfigurada()) return null;
  let sessao;
  try {
    sessao = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error("[painel-auth] falha ao ler sessão:", e);
    return null;
  }
  const u = sessao?.user as
    | {
        id: string;
        name: string;
        email: string;
        role?: string | null;
        banned?: boolean | null;
        regioes?: unknown;
      }
    | undefined;
  if (!u || u.banned) return null;

  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    papel: u.role === "admin" ? "admin" : "coordenador", // "user" no banco
    regioes: Array.isArray(u.regioes)
      ? (u.regioes as unknown[]).filter(
          (r): r is string => typeof r === "string",
        )
      : [],
  };
}

/** Usuário com o papel exigido, ou null. */
export async function exigirPapel(
  papel: Papel,
): Promise<UsuarioPainel | null> {
  const usuario = await usuarioLogado();
  if (!usuario) return null;
  if (papel === "admin" && usuario.papel !== "admin") return null;
  return usuario;
}

/** Regiões que o usuário pode ver. null = todas (admin). */
export function regioesPermitidas(usuario: UsuarioPainel): string[] | null {
  return usuario.papel === "admin" ? null : usuario.regioes;
}

/** Já existe algum administrador? Define se o painel pede o 1º cadastro. */
export async function existeAdmin(): Promise<boolean> {
  if (!autenticacaoConfigurada()) return false;
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    const { rows } = await pool.query(
      `SELECT 1 FROM "user" WHERE role = 'admin' AND (banned IS NOT TRUE) LIMIT 1`,
    );
    await pool.end();
    return rows.length > 0;
  } catch (e) {
    console.error("[painel-auth] falha ao checar admin:", e);
    return true; // no erro, não expõe o cadastro aberto
  }
}
