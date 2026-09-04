import "server-only";
import { enviarEmail } from "@/lib/email";
import { gerarRelatorio, type Relatorio } from "@/lib/relatorio";
import { nomeRegiaoParaFamilia } from "@/lib/rede";
import { getPool } from "@/lib/db";
import { registrarAcesso } from "@/lib/usuarios";

/**
 * Relatório mensal por e-mail.
 *
 * Quem recebe são as pessoas cadastradas no painel, cada uma com o
 * recorte das regiões dela — a mesma regra da tela. Não existe uma lista
 * de destinatários à parte, e é melhor assim: lista paralela envelhece,
 * e alguém desligado continuaria recebendo dado de família por anos.
 *
 * O corpo é HTML de tabela, como o resto dos e-mails do projeto: cliente
 * de e-mail não é navegador, e flexbox some no Outlook. As cores são as
 * da campanha, e os números vão em texto — imagem bloqueada é o padrão
 * em quase todo cliente corporativo.
 *
 * O e-mail é resumo, não substituto: a lista nominal de famílias fica no
 * painel, atrás de login. Mandar nome e telefone de trinta famílias por
 * e-mail espalharia dado pessoal por caixas que ninguém controla.
 */

const OURO = "#f8c038";
const OURO_TEXTO = "#a8700a";
const NAVY = "#0e1330";
const TINTA = "#565f82";
const CREME = "#faf6ed";
const FIO = "#f1ece2";
const FONTE =
  "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escapar(v: string): string {
  return v.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}

function barra(rotulo: string, valor: number, maior: number): string {
  const largura = Math.max(2, Math.round((valor / Math.max(1, maior)) * 100));
  return `
      <tr>
        <td style="padding:9px 0 3px;font:600 14px/1.4 ${FONTE};color:${NAVY}">
          ${escapar(rotulo)}
          <span style="float:right;font-weight:800">${valor}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 5px">
          <!-- Barra como tabela: div com largura percentual não é
               confiável no Outlook, tabela é. -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td bgcolor="#f1ece2" style="border-radius:3px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${largura}%">
                  <tr><td bgcolor="${OURO}" height="6" style="border-radius:3px;font-size:0;line-height:0">&nbsp;</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
}

function bloco(titulo: string, linhas: { rotulo: string; total: number }[]): string {
  if (!linhas.length) return "";
  const maior = Math.max(...linhas.map((l) => l.total));
  return `
    <tr>
      <td style="padding:26px 32px 0">
        <p style="margin:0 0 4px;font:800 10.5px/1.4 ${FONTE};letter-spacing:.18em;text-transform:uppercase;color:${OURO_TEXTO}">
          ${escapar(titulo)}
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${linhas.slice(0, 6).map((l) => barra(l.rotulo, l.total, maior)).join("")}
        </table>
      </td>
    </tr>`;
}

export function montarCorpo(dados: Relatorio, nome: string, painelUrl: string): string {
  const comparacao =
    dados.variacao === null
      ? "Primeiro mês com dados para comparar."
      : dados.variacao >= 0
        ? `${dados.variacao > 0 ? "+" : ""}${dados.variacao}% em relação ao mês anterior (${dados.totalAnterior}).`
        : `${dados.variacao}% em relação ao mês anterior (${dados.totalAnterior}).`;

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Relatório de ${escapar(dados.rotulo)}</title></head>
<body style="margin:0;padding:0;background:${CREME}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${CREME}">
  <tr><td align="center" style="padding:28px 12px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
           style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden">

      <tr>
        <td bgcolor="${NAVY}" style="padding:26px 32px">
          <p style="margin:0;font:800 10.5px/1.4 ${FONTE};letter-spacing:.2em;text-transform:uppercase;color:${OURO}">
            Educação Adventista Centro-Oeste
          </p>
          <p style="margin:6px 0 0;font:800 24px/1.2 ${FONTE};color:#ffffff">
            Matrículas em ${escapar(dados.rotulo)}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:28px 32px 0">
          <p style="margin:0 0 18px;font:400 15.5px/1.6 ${FONTE};color:${TINTA}">
            Olá, ${escapar(nome)}. Este é o resumo do mês nas regiões que
            você acompanha.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td bgcolor="${OURO}" style="padding:20px 22px;border-radius:14px">
                <p style="margin:0;font:800 10.5px/1.4 ${FONTE};letter-spacing:.18em;text-transform:uppercase;color:rgba(14,19,48,.65)">
                  Famílias que pediram contato
                </p>
                <p style="margin:4px 0 0;font:800 42px/1 ${FONTE};color:${NAVY}">${dados.total}</p>
                <p style="margin:6px 0 0;font:600 14px/1.5 ${FONTE};color:rgba(14,19,48,.75)">
                  ${escapar(comparacao)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:18px 32px 0">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="33%" valign="top" style="padding-right:6px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                       style="border:1px solid ${FIO};border-radius:12px">
                  <tr><td style="padding:14px 12px">
                    <p style="margin:0;font:800 10px/1.4 ${FONTE};letter-spacing:.12em;text-transform:uppercase;color:${OURO_TEXTO}">Atendidas</p>
                    <p style="margin:2px 0 0;font:800 26px/1.1 ${FONTE};color:${NAVY}">${dados.atendidos}</p>
                  </td></tr>
                </table>
              </td>
              <td width="34%" valign="top" style="padding:0 3px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                       style="border:1px solid ${FIO};border-radius:12px">
                  <tr><td style="padding:14px 12px">
                    <p style="margin:0;font:800 10px/1.4 ${FONTE};letter-spacing:.12em;text-transform:uppercase;color:${OURO_TEXTO}">Em atendimento</p>
                    <p style="margin:2px 0 0;font:800 26px/1.1 ${FONTE};color:${NAVY}">${dados.emAtendimento}</p>
                  </td></tr>
                </table>
              </td>
              <td width="33%" valign="top" style="padding-left:6px">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                       style="border:1px solid ${FIO};border-radius:12px">
                  <tr><td style="padding:14px 12px">
                    <p style="margin:0;font:800 10px/1.4 ${FONTE};letter-spacing:.12em;text-transform:uppercase;color:${OURO_TEXTO}">Aguardando</p>
                    <p style="margin:2px 0 0;font:800 26px/1.1 ${FONTE};color:${NAVY}">${dados.aguardando}</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${bloco("Por região", dados.porRegiao)}
      ${bloco("Escolas mais procuradas", dados.porEscola)}
      ${bloco("Séries pretendidas", dados.porNivel)}
      ${bloco("De onde vieram", dados.porCampanha)}

      <tr>
        <td align="center" style="padding:30px 32px 8px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="${NAVY}" style="border-radius:999px">
              <a href="${escapar(painelUrl)}"
                 style="display:inline-block;padding:14px 30px;font:700 15px/1 ${FONTE};color:#ffffff;text-decoration:none">
                Ver a lista de famílias no painel
              </a>
            </td></tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:14px 32px 30px">
          <p style="margin:0;font:400 12.5px/1.6 ${FONTE};color:#8a92ad;text-align:center">
            Os nomes e telefones ficam no painel, atrás de login — não são
            enviados por e-mail. Mensagem automática do primeiro dia útil
            do mês.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Versão em texto, para cliente que não abre HTML e para o resumo do inbox. */
function montarTexto(dados: Relatorio, nome: string, painelUrl: string): string {
  const linhas = dados.porRegiao
    .map((r) => `  ${r.rotulo}: ${r.total} (${r.atendidos} atendidas)`)
    .join("\n");
  return [
    `Olá, ${nome}.`,
    "",
    `Matrículas em ${dados.rotulo}`,
    `Famílias que pediram contato: ${dados.total}`,
    `Atendidas: ${dados.atendidos} · Em atendimento: ${dados.emAtendimento} · Aguardando: ${dados.aguardando}`,
    "",
    "Por região:",
    linhas,
    "",
    `A lista de famílias está no painel: ${painelUrl}`,
  ].join("\n");
}

/**
 * Há alguém que ainda não recebeu o oficial deste mês? É o que o cron
 * diário consulta: enquanto houver, ele tenta; quando zerar, para. Assim
 * uma falha parcial no dia 1 é retomada no dia 2 sem ninguém intervir.
 */
export async function haPendentes(ano: number, mes: number): Promise<boolean | null> {
  const db = getPool();
  // null, e não false: sem banco não dá para dizer "todo mundo recebeu",
  // e a rota tem de responder erro, não "nada a fazer".
  if (!db) return null;
  const { rows } = await db.query(
    `SELECT 1
       FROM "user" u
      WHERE u.banned IS NOT TRUE AND u.email <> ''
        AND (u.role = 'admin' OR jsonb_array_length(coalesce(u.regioes, '[]'::jsonb)) > 0)
        AND NOT EXISTS (
          SELECT 1 FROM relatorios_enviados r
           WHERE r.ano = $1 AND r.mes = $2 AND r.usuario_id = u.id
             AND r.tipo = 'oficial' AND r.enviado_em IS NOT NULL)
      LIMIT 1`,
    [ano, mes],
  );
  return rows.length > 0;
}

export interface ResultadoEnvio {
  enviados: number;
  pulados: number;
  falhas: number;
  detalhes: string[];
}

/**
 * Monta e manda o relatório do mês para cada pessoa do painel.
 *
 * Cada destinatário é REIVINDICADO no banco antes do envio, com uma
 * inserção que só entra se ainda não existir. É o que garante, ao mesmo
 * tempo: que ninguém recebe duas vezes, que uma falha no décimo não
 * impede o décimo primeiro, e que duas execuções simultâneas não
 * dupliquem — a segunda perde a inserção e pula.
 *
 * Se o envio falhar depois da reivindicação, a linha é desfeita para a
 * próxima rodada tentar de novo.
 *
 * `tipo: "teste"` é para conferir o layout antes do fechamento sem
 * consumir a vez oficial daquela pessoa naquele mês.
 */
export async function enviarRelatorioMensal(opcoes: {
  ano: number;
  mes: number;
  painelUrl: string;
  tipo?: "oficial" | "teste";
}): Promise<ResultadoEnvio & { semBanco?: boolean }> {
  const resultado: ResultadoEnvio & { semBanco?: boolean } = {
    enviados: 0,
    pulados: 0,
    falhas: 0,
    detalhes: [],
  };
  const db = getPool();
  if (!db) {
    resultado.semBanco = true;
    resultado.detalhes.push("sem banco");
    return resultado;
  }
  const tipo = opcoes.tipo ?? "oficial";

  const { rows: pessoas } = await db.query(
    `SELECT id, name, email, role, regioes
       FROM "user"
      WHERE banned IS NOT TRUE AND email <> ''`,
  );

  for (const p of pessoas) {
    const admin = p.role === "admin";
    const regioes: string[] = Array.isArray(p.regioes) ? p.regioes : [];

    // Coordenador sem região não recebe nada: mandar um relatório vazio
    // só ensina a ignorar a mensagem.
    if (!admin && regioes.length === 0) {
      resultado.pulados += 1;
      resultado.detalhes.push(`${p.email}: sem região`);
      continue;
    }

    // Reivindica antes de montar qualquer coisa. A linha entra SEM
    // enviado_em; só o envio bem-sucedido preenche. Quem perder a
    // inserção pula — a não ser que a linha seja uma reivindicação
    // velha sem envio (processo que caiu no meio), que é retomada.
    const { rowCount } = await db.query(
      `INSERT INTO relatorios_enviados (ano, mes, usuario_id, tipo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (ano, mes, usuario_id, tipo) DO UPDATE
         SET reivindicado_em = now()
       WHERE relatorios_enviados.enviado_em IS NULL
         AND relatorios_enviados.reivindicado_em < now() - interval '15 minutes'`,
      [opcoes.ano, opcoes.mes, p.id, tipo],
    );
    if (!rowCount) {
      resultado.pulados += 1;
      resultado.detalhes.push(`${p.email}: já enviado ou em andamento`);
      continue;
    }

    // Falha solta a vez na hora. Se este DELETE falhar, a linha fica sem
    // enviado_em e vence em 15 minutos — a próxima rodada retoma.
    const desfazer = () =>
      db
        .query(
          `DELETE FROM relatorios_enviados
            WHERE ano = $1 AND mes = $2 AND usuario_id = $3 AND tipo = $4
              AND enviado_em IS NULL`,
          [opcoes.ano, opcoes.mes, p.id, tipo],
        )
        .catch(() => {});

    const dados = await gerarRelatorio({
      ano: opcoes.ano,
      mes: opcoes.mes,
      regioesPermitidas: admin ? null : regioes,
      nomeRegiao: nomeRegiaoParaFamilia,
    });

    if (!dados || dados.total === 0) {
      await desfazer();
      resultado.pulados += 1;
      resultado.detalhes.push(`${p.email}: nenhum lead no mês`);
      continue;
    }

    const nome = (p.name as string) || "equipe";
    const ok = await enviarEmail({
      para: p.email,
      assunto: `Matrículas em ${dados.rotulo}: ${dados.total} famílias`,
      html: montarCorpo(dados, nome, opcoes.painelUrl),
      texto: montarTexto(dados, nome, opcoes.painelUrl),
    }).catch(() => false);

    if (ok) {
      await db.query(
        `UPDATE relatorios_enviados SET enviado_em = now()
          WHERE ano = $1 AND mes = $2 AND usuario_id = $3 AND tipo = $4`,
        [opcoes.ano, opcoes.mes, p.id, tipo],
      );
      resultado.enviados += 1;
      await registrarAcesso("relatorio_enviado", {
        usuarioId: p.id,
        usuarioNome: nome,
        detalhe: `${opcoes.mes}/${opcoes.ano} · ${dados.total} leads${tipo === "teste" ? " · teste" : ""}`,
      });
    } else {
      // Solta a vez para a próxima rodada tentar de novo.
      await desfazer();
      resultado.falhas += 1;
      resultado.detalhes.push(`${p.email}: falha no envio`);
    }
  }

  return resultado;
}
