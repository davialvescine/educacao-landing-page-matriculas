import { getPool } from "@/lib/db";
import { agenteDaRequisicao, ipDaRequisicao } from "@/lib/requisicao";

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
  | "alterou_usuario"
  | "alterou_regiao";

export interface OpcoesAcesso {
  usuarioId?: string;
  usuarioNome?: string;
  detalhe?: string;
  /** De onde partiu. Passe a requisição em `origem` para preencher os dois. */
  ip?: string;
  agente?: string;
}

/**
 * Grava uma ação na trilha. Nunca lança: auditoria que derruba a operação
 * auditada é pior do que auditoria nenhuma — a coordenação perderia o
 * acesso porque o registro falhou.
 */
export async function registrarAcesso(
  acao: AcaoAcesso,
  opcoes: OpcoesAcesso = {},
): Promise<void> {
  const db = getPool();
  if (!db) return;
  await db
    .query(
      `INSERT INTO acessos (usuario_id, usuario_nome, acao, detalhe, ip, agente)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        opcoes.usuarioId ?? null,
        opcoes.usuarioNome ?? "",
        acao,
        opcoes.detalhe ?? "",
        opcoes.ip ?? "",
        opcoes.agente ?? "",
      ],
    )
    .catch((e) => console.error("[acessos] falha ao registrar:", e));
}

/** Atalho para as rotas: monta ip e agente a partir da requisição. */
export function origem(req: Request): { ip: string; agente: string } {
  return { ip: ipDaRequisicao(req), agente: agenteDaRequisicao(req) };
}

/**
 * Registros antigos guardavam o identificador interno do usuário. Ele não
 * diz nada a quem lê e não deve trafegar até o navegador, então some aqui.
 * O banco mantém o valor original: histórico de auditoria não se reescreve.
 */
function detalheLegivel(detalhe: string): string {
  return detalhe.replace(/\b[A-Za-z0-9_-]{20,}\b/g, "um usuário");
}

export interface Acesso {
  id: string;
  usuario_nome: string;
  acao: string;
  detalhe: string;
  ip: string;
  criado_em: string;
}

export async function listarAcessos(limite = 50): Promise<Acesso[]> {
  const db = getPool();
  if (!db) return [];
  const { rows } = await db.query(
    `SELECT id, usuario_nome, acao, detalhe, ip, criado_em
     FROM acessos ORDER BY criado_em DESC LIMIT $1`,
    [limite],
  );
  // O agente fica no banco e não sobe para a tela: é longo, ilegível e só
  // interessa quando alguém investiga um caso específico, direto no banco.
  return rows.map((r) => ({
    id: String(r.id),
    usuario_nome: String(r.usuario_nome),
    acao: String(r.acao),
    detalhe: detalheLegivel(String(r.detalhe)),
    ip: String(r.ip ?? ""),
    criado_em: new Date(r.criado_em).toISOString(),
  }));
}
