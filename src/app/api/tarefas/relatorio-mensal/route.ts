import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { emailConfigurado } from "@/lib/email";
import { dataEmBrasilia, mesAnterior, primeiroDiaUtil } from "@/lib/relatorio";
import { enviarRelatorioMensal } from "@/lib/relatorio-email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Tarefa agendada: relatório do mês que fechou, por e-mail.
 *
 * Agende TODO DIA, e não só no primeiro dia útil:
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SEGREDO" \
 *        https://<dominio>/api/tarefas/relatorio-mensal
 *
 * Rodar diariamente é mais simples de configurar e, principalmente,
 * sobrevive ao servidor estar fora justamente no dia marcado — a tarefa
 * pega no dia seguinte. Quem garante que cada pessoa recebe uma vez só é
 * a tabela relatorios_enviados, reivindicada antes de cada envio.
 *
 * O segredo vai no cabeçalho, não na URL: URL fica em histórico de shell,
 * log de acesso e tela de configuração do agendador, e este segredo agora
 * dispara e-mail de verdade. `?segredo=` continua aceito por compatibilidade
 * com o agendamento antigo, mas está deprecado.
 *
 * `?teste=1&ano=&mes=` manda agora, fora da data, marcado como TESTE: não
 * consome a vez oficial daquela pessoa naquele mês. Sem `teste`, ano/mes
 * mandam o oficial daquele mês — e precisam vir os dois, válidos.
 */

function autorizado(req: Request): boolean {
  const esperado = process.env.CRON_SEGREDO;
  if (!esperado) return false;
  const cabecalho = req.headers.get("authorization") ?? "";
  const doCabecalho = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
  const daUrl = new URL(req.url).searchParams.get("segredo") ?? "";
  const recebido = doCabecalho || daUrl;
  if (!recebido) return false;
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const ANO_MIN = 2025;

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

  // Parâmetro de mês informado tem de ser válido, senão a rota cairia
  // em silêncio no mês anterior — e com um erro de digitação alguém
  // dispararia o envio oficial errado.
  let manual: { ano: number; mes: number } | null = null;
  if (anoBruto !== null || mesBruto !== null) {
    const ano = Number(anoBruto);
    const mes = Number(mesBruto);
    const hojeAno = dataEmBrasilia(new Date()).ano;
    const valido =
      Number.isInteger(ano) &&
      Number.isInteger(mes) &&
      ano >= ANO_MIN &&
      ano <= hojeAno + 1 &&
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

  // "Hoje" visto de Brasília, não do fuso do processo.
  const hoje = dataEmBrasilia(new Date());
  const alvo = manual ?? mesAnterior(hoje.ano, hoje.mes);

  // Fora do primeiro dia útil a tarefa não faz nada e responde ok: cron
  // que devolve erro todo dia treina a equipe a ignorar o alarme.
  const diaUtil = primeiroDiaUtil(hoje.ano, hoje.mes);
  if (!manual && hoje.dia !== diaUtil) {
    return NextResponse.json({
      ok: true,
      enviado: false,
      motivo: `hoje não é o primeiro dia útil (é dia ${diaUtil})`,
    });
  }

  const resultado = await enviarRelatorioMensal({
    ...alvo,
    tipo: teste ? "teste" : "oficial",
    painelUrl: `${SITE_URL}/painel/relatorio?ano=${alvo.ano}&mes=${alvo.mes}`,
  });

  // Falha precisa VOLTAR como falha: `curl -f` e o monitor do agendador
  // só enxergam o status. 200 com vinte falhas dentro do JSON é sucesso
  // para eles, e ninguém fica sabendo.
  const status = resultado.semBanco || (resultado.falhas > 0 && resultado.enviados === 0)
    ? 500
    : resultado.falhas > 0
      ? 207
      : 200;

  return NextResponse.json(
    { ok: status === 200, enviado: resultado.enviados > 0, tipo: teste ? "teste" : "oficial", ...alvo, ...resultado },
    { status },
  );
}

/** GET continua funcionando para o agendamento antigo, mas é o mesmo POST. */
export const GET = POST;
