import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { emailConfigurado } from "@/lib/email";
import { dataEmBrasilia, mesAnterior, primeiroDiaUtil } from "@/lib/relatorio";
import { enviarRelatorioMensal, haPendentes } from "@/lib/relatorio-email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Tarefa agendada: relatório do mês que fechou, por e-mail.
 *
 * Agende TODO DIA:
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SEGREDO" \
 *        https://<dominio>/api/tarefas/relatorio-mensal
 *
 * A regra de disparo não é "hoje é o dia X", é "há alguém sem o oficial
 * deste mês, e ainda estamos na janela". A janela vai do primeiro dia
 * útil ao dia 7. Assim: servidor fora no dia 1, sai no dia 2; dez dos
 * vinte falharam no dia 1, os dez saem no dia 2; e quando todo mundo
 * recebeu, a rota não faz nada até o mês seguinte. Quem garante uma vez
 * só por pessoa é relatorios_enviados, reivindicada antes de cada envio.
 *
 * O segredo vai SÓ no cabeçalho. URL fica em histórico de shell, log de
 * acesso e tela do agendador, e este segredo dispara e-mail de verdade.
 *
 * `?teste=1&ano=&mes=` manda agora, marcado como TESTE: não consome a vez
 * oficial de ninguém. Exige ano e mês, os dois — teste sem alvo explícito
 * já mandou o mês errado uma vez em revisão.
 */

function autorizado(req: Request): boolean {
  const esperado = process.env.CRON_SEGREDO;
  if (!esperado) return false;
  const cabecalho = req.headers.get("authorization") ?? "";
  const recebido = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
  if (!recebido) return false;
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const ANO_MIN = 2025;
/** Último dia do mês em que o oficial ainda sai automaticamente. */
const ULTIMO_DIA_JANELA = 7;

export async function POST(req: Request) {
  if (!process.env.CRON_SEGREDO) {
    return NextResponse.json(
      { erro: "Tarefa não configurada. Defina CRON_SEGREDO." },
      { status: 503 },
    );
  }
  if (!autorizado(req)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  if (!emailConfigurado()) {
    return NextResponse.json(
      { erro: "SMTP não configurado. Defina SMTP_HOST e companhia." },
      { status: 503 },
    );
  }

  const params = new URL(req.url).searchParams;
  const teste = params.get("teste") === "1";
  const anoBruto = params.get("ano");
  const mesBruto = params.get("mes");
  const hoje = dataEmBrasilia(new Date());

  let manual: { ano: number; mes: number } | null = null;
  if (anoBruto !== null || mesBruto !== null || teste) {
    const ano = Number(anoBruto);
    const mes = Number(mesBruto);
    const valido =
      Number.isInteger(ano) &&
      Number.isInteger(mes) &&
      ano >= ANO_MIN &&
      ano <= hoje.ano + 1 &&
      mes >= 1 &&
      mes <= 12;
    if (!valido) {
      return NextResponse.json(
        { erro: "Informe ano e mes válidos, os dois (ex.: ano=2026&mes=9)." },
        { status: 400 },
      );
    }
    manual = { ano, mes };
  }

  const alvo = manual ?? mesAnterior(hoje.ano, hoje.mes);

  if (!manual) {
    const diaUtil = primeiroDiaUtil(hoje.ano, hoje.mes);
    if (hoje.dia < diaUtil || hoje.dia > ULTIMO_DIA_JANELA) {
      return NextResponse.json({
        ok: true,
        enviado: false,
        motivo: `fora da janela (dia ${diaUtil} a ${ULTIMO_DIA_JANELA})`,
      });
    }
    if (!(await haPendentes(alvo.ano, alvo.mes))) {
      return NextResponse.json({
        ok: true,
        enviado: false,
        motivo: `todo mundo já recebeu ${alvo.mes}/${alvo.ano}`,
      });
    }
  }

  const resultado = await enviarRelatorioMensal({
    ...alvo,
    tipo: teste ? "teste" : "oficial",
    painelUrl: `${SITE_URL}/painel/relatorio?ano=${alvo.ano}&mes=${alvo.mes}`,
  });

  // Qualquer falha é 500. Um 207 seria "sucesso" para `curl -f` e para o
  // monitor do agendador — e vinte falhas dentro do JSON passariam em
  // silêncio. O JSON continua dizendo exatamente o que saiu e o que não.
  const falhou = resultado.semBanco || resultado.falhas > 0;
  return NextResponse.json(
    {
      ok: !falhou,
      enviado: resultado.enviados > 0,
      tipo: teste ? "teste" : "oficial",
      ...alvo,
      ...resultado,
    },
    { status: falhou ? 500 : 200 },
  );
}
