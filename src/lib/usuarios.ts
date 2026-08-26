import { getPool } from "@/lib/db";

/**
 * Registro de acessos ao painel (LGPD: quem entrou, exportou e reenviou
 * dados de famílias). As contas em si são geridas pelo Better Auth.
 */

export type AcaoAcesso =
  | "login"
  | "login_falhou"
  | "exportou"
  | "reenviou"
  | "criou_usuario"
  | "alterou_usuario";

export async function registrarAcesso(
  acao: AcaoAcesso,
  opcoes: { usuarioId?: string; usuarioNome?: string; detalhe?: string } = {},
): Promise<void> {
  const db = getPool();
  if (!db) return;
  await db
    .query(
      `INSERT INTO acessos (usuario_id, usuario_nome, acao, detalhe)
       VALUES ($1, $2, $3, $4)`,
      [
        opcoes.usuarioId ?? null,
        opcoes.usuarioNome ?? "",
        acao,
        opcoes.detalhe ?? "",
      ],
    )
    .catch((e) => console.error("[acessos] falha ao registrar:", e));
}

export interface Acesso {
  id: string;
  usuario_nome: string;
  acao: string;
  detalhe: string;
  criado_em: string;
}

export async function listarAcessos(limite = 50): Promise<Acesso[]> {
  const db = getPool();
  if (!db) return [];
  const { rows } = await db.query(
    `SELECT id, usuario_nome, acao, detalhe, criado_em
     FROM acessos ORDER BY criado_em DESC LIMIT $1`,
    [limite],
  );
  return rows.map((r) => ({
    id: String(r.id),
    usuario_nome: String(r.usuario_nome),
    acao: String(r.acao),
    detalhe: String(r.detalhe),
    criado_em: new Date(r.criado_em).toISOString(),
  }));
}
