import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { salvarLead, type LeadNovo } from "@/lib/leads";
import { enviarLeadWebhook } from "@/lib/webhook";
import { ehSlugDeProjeto, getProjeto } from "@/lib/projetos";

export const runtime = "nodejs";

/**
 * Entrada de lead vinda de projeto externo — hoje, a landing do Educação
 * dos Sonhos, que vive em repositório e domínio próprios.
 *
 * É servidor-a-servidor, não navegador: o token nunca vai para o cliente,
 * e por isso não há CORS aqui. A landing recebe o formulário no próprio
 * backend e repassa para cá. API pública com CORS deixaria qualquer um
 * despejar lead no painel.
 *
 * O que este sistema continua fazendo por ela: gravar antes de enviar,
 * mandar ao CRM com etiqueta do projeto, e reprocessar pela fila se o CRM
 * estiver fora. Nada disso precisa existir duas vezes.
 */

function autorizado(cabecalho: string | null): boolean {
  const esperado = process.env.LEAD_API_TOKEN;
  if (!esperado) return false;
  const recebido = cabecalho?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function limpar(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  if (!process.env.LEAD_API_TOKEN) {
    return NextResponse.json(
      { erro: "Entrada externa não configurada. Defina LEAD_API_TOKEN." },
      { status: 503 },
    );
  }
  if (!autorizado(req.headers.get("authorization"))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const slug = limpar(body.projeto, 40);
  if (!ehSlugDeProjeto(slug) || !getProjeto(slug)?.externo) {
    return NextResponse.json(
      { erro: "Informe um projeto externo conhecido." },
      { status: 400 },
    );
  }

  const lead: LeadNovo = {
    projeto: slug,
    nome: limpar(body.nome, 120),
    whatsapp: limpar(body.whatsapp, 20),
    email: limpar(body.email, 160),
    cidade: limpar(body.cidade, 90),
    // Projeto externo não tem o conceito de associação nem de unidade:
    // o lead entra sem região e fica visível ao administrador. Se um dia
    // a rede quiser encaminhar por região, é só passar o slug aqui.
    estado: limpar(body.estado, 40),
    escola: limpar(body.escola, 120),
    nivel: limpar(body.nivel, 60),
    utm: null,
  };

  if (!lead.nome || !lead.whatsapp) {
    return NextResponse.json(
      { erro: "Informe nome e WhatsApp." },
      { status: 400 },
    );
  }
  const digitos = lead.whatsapp.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 13) {
    return NextResponse.json(
      { erro: "Informe um WhatsApp válido com DDD." },
      { status: 400 },
    );
  }

  let id: string;
  try {
    id = await salvarLead(lead);
  } catch (e) {
    console.error("[leads/externo] falha ao salvar:", e);
    return NextResponse.json(
      { erro: "Não foi possível registrar." },
      { status: 500 },
    );
  }

  // Grava primeiro, envia depois: se o CRM cair, a fila reprocessa.
  await enviarLeadWebhook(id, lead);

  return NextResponse.json({ ok: true, id });
}
