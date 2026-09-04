import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { emailConfigurado } from "@/lib/email";
import { mesAnterior, primeiroDiaUtil } from "@/lib/relatorio";
import { enviarRelatorioMensal, jaEnviado } from "@/lib/relatorio-email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Tarefa agendada: relatório do mês que fechou, por e-mail.
 *
 * Agende TODO DIA, e não só no primeiro dia útil:
 *   curl -fsS "https://<dominio>/api/tarefas/relatorio-mensal?segredo=<CRON_SEGREDO>"
 *
 * Rodar diariamente é mais simples de configurar e, principalmente,
 * sobrevive ao servidor estar fora justamente no dia marcado — a tarefa
 * pega no dia seguinte. Quem garante que sai uma vez só é o registro na
 * trilha, conferido antes de qualquer envio.
 *
 * `?forcar=1` manda agora, fora da data, para conferir o layout antes de
 * o primeiro mês fechar. Continua respeitando o "já enviado", então não
 * duplica; para reenviar de propósito, passe também `?ano=&mes=`.
 */

function autorizado(segredo: string | null): boolean {
  const esperado = process.env.CRON_SEGREDO;
  if (!esperado || !segredo) return false;
  const a = Buffer.from(segredo, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!process.env.CRON_SEGREDO) {
    return NextResponse.json(
      { erro: "Tarefa não configurada. Defina CRON_SEGREDO." },
      { status: 503 },
    );
  }
  const params = new URL(req.url).searchParams;
  if (!autorizado(params.get("segredo"))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  if (!emailConfigurado()) {
    return NextResponse.json(
      { erro: "SMTP não configurado. Defina SMTP_HOST e companhia." },
      { status: 503 },
    );
  }

  const hoje = new Date();
  const forcar = params.get("forcar") === "1";
  const anoPedido = Number(params.get("ano"));
  const mesPedido = Number(params.get("mes"));
  const manual =
    Number.isInteger(anoPedido) &&
    Number.isInteger(mesPedido) &&
    mesPedido >= 1 &&
    mesPedido <= 12;

  const alvo = manual
    ? { ano: anoPedido, mes: mesPedido }
    : mesAnterior(hoje.getFullYear(), hoje.getMonth() + 1);

  // Fora do primeiro dia útil a tarefa não faz nada e responde ok: cron
  // que devolve erro todo dia treina a equipe a ignorar o alarme.
  const dia = primeiroDiaUtil(hoje.getFullYear(), hoje.getMonth() + 1);
  const noDia = hoje.getDate() === dia.getDate();
  if (!noDia && !forcar && !manual) {
    return NextResponse.json({
      ok: true,
      enviado: false,
      motivo: `hoje não é o primeiro dia útil (é dia ${dia.getDate()})`,
    });
  }

  if (!manual && (await jaEnviado(alvo.ano, alvo.mes))) {
    return NextResponse.json({
      ok: true,
      enviado: false,
      motivo: `relatório de ${alvo.mes}/${alvo.ano} já foi enviado`,
    });
  }

  const resultado = await enviarRelatorioMensal({
    ...alvo,
    painelUrl: `${SITE_URL}/painel/relatorio?ano=${alvo.ano}&mes=${alvo.mes}`,
  });

  return NextResponse.json({ ok: true, enviado: true, mes: alvo.mes, ano: alvo.ano, ...resultado });
}

export const POST = GET;
