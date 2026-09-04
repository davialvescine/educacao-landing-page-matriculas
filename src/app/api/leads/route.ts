import { NextResponse } from "next/server";
import {
  getEscola,
  nomeRegiaoParaFamilia,
  resolverRegiaoInterna,
} from "@/lib/rede";
import { slugificar } from "@/lib/site";
import { salvarLead, type LeadNovo } from "@/lib/leads";
import { PROJETO_PADRAO } from "@/lib/projetos";
import { enviarLeadWebhook } from "@/lib/webhook";
import { enviarConfirmacaoLead, type EscolaEmail } from "@/lib/email";

export const runtime = "nodejs";

function limpar(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const CHAVES_UTM = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

function limparUtm(v: unknown): Record<string, string> | null {
  if (!v || typeof v !== "object") return null;
  const bruto = v as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const chave of CHAVES_UTM) {
    const valor = limpar(bruto[chave], 200);
    if (valor) utm[chave] = valor;
  }
  return Object.keys(utm).length ? utm : null;
}

/**
 * Dados da escola escolhida para o e-mail de confirmação.
 * A foto só entra quando a unidade tem imagem própria: 6 das 39 ainda
 * reaproveitam a foto de outra escola, e mostrar o prédio errado é pior
 * do que não mostrar prédio nenhum.
 */
function escolaDoEmail(
  estadoSlug: string,
  nomeEscola: string,
): EscolaEmail | undefined {
  if (!nomeEscola) return undefined;
  const achado = getEscola(estadoSlug, slugificar(nomeEscola));
  if (!achado) return { nome: nomeEscola, foto: null };

  const { escola } = achado;
  const propria = escola.foto && escola.foto_propria;
  const arquivo = propria
    ? `imagens/email/unidades/${escola.foto!.split("/").pop()!.replace(/\.png$/i, ".jpg")}`
    : null;

  return { nome: nomeEscola, foto: arquivo };
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const lead: LeadNovo = {
    // Esta rota é do formulário deste site. Lead de projeto externo entra
    // por /api/leads/externo, autenticado.
    projeto: PROJETO_PADRAO.slug,
    nome: limpar(body.nome, 120),
    whatsapp: limpar(body.whatsapp, 20),
    email: limpar(body.email, 160),
    estado: limpar(body.estado, 40),
    escola: limpar(body.escola, 120),
    cidade: limpar(body.cidade, 90),
    nivel: limpar(body.nivel, 60),
    utm: limparUtm(body.utm),
  };

  if (!lead.nome || !lead.whatsapp) {
    return NextResponse.json(
      { erro: "Informe nome e WhatsApp." },
      { status: 400 },
    );
  }
  if (!lead.cidade) {
    return NextResponse.json(
      { erro: "Informe a sua cidade." },
      { status: 400 },
    );
  }
  // A escola é o que diz qual equipe atende a família — e, no Mato Grosso,
  // qual das duas associações fica com o lead.
  if (!lead.escola) {
    return NextResponse.json(
      { erro: "Escolha a escola de interesse." },
      { status: 400 },
    );
  }
  // O site tem uma página só de Mato Grosso; o lead precisa nascer já na
  // associação certa (ALM ou AOM), que é o recorte do painel. Quem decide
  // é a escola escolhida.
  const estado = resolverRegiaoInterna(lead.estado, lead.escola);
  if (!estado) {
    return NextResponse.json(
      {
        erro:
          lead.estado === "mato-grosso"
            ? "Selecione a escola de Mato Grosso."
            : "Selecione a região.",
      },
      { status: 400 },
    );
  }
  // A partir daqui o lead viaja e é gravado com a associação interna.
  lead.estado = estado.slug;
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
    console.error("[leads] falha ao salvar:", e);
    return NextResponse.json(
      { erro: "Não foi possível registrar. Tente novamente." },
      { status: 500 },
    );
  }

  // Dispara para o sistema externo depois de salvar: lead nunca se perde.
  await enviarLeadWebhook(id, lead);

  // Confirmação para a família. Só sai se ela informou e-mail (campo opcional)
  // e nunca derruba a resposta: falha de SMTP não pode custar uma matrícula.
  if (lead.email) {
    // A sigla da associação (ABC, APLAC...) não diz nada para a família:
    // o e-mail fala pela região, do jeito que ela escolheu no formulário.
    await enviarConfirmacaoLead({
      para: lead.email,
      nome: lead.nome,
      // A família escolheu "Mato Grosso"; dizer "Leste Mato-Grossense" no
      // e-mail é falar por uma divisão que ela não conhece.
      equipe:
        estado.slug === "iabc"
          ? "do IABC"
          : `em ${nomeRegiaoParaFamilia(estado.slug)}`,
      regiao: nomeRegiaoParaFamilia(estado.slug),
      whatsapp: estado.whatsapp.link,
      telefone: lead.whatsapp,
      cidade: lead.cidade,
      nivel: lead.nivel,
      escola: escolaDoEmail(estado.slug, lead.escola),
    }).catch((e) => console.error("[leads] confirmação não enviada:", e));
  }

  return NextResponse.json({ ok: true, id });
}
