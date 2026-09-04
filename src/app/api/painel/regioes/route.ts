import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { exigirPapel } from "@/lib/painel-auth";
import { registrarAcesso } from "@/lib/usuarios";
import { getEstados } from "@/lib/rede";
import { linkWhatsapp, salvarWhatsappRegiao } from "@/lib/regioes";

export const runtime = "nodejs";

const SLUGS = new Set(getEstados().map((e) => e.slug));

/**
 * Salva o WhatsApp de uma região. Só administrador.
 *
 * O site é estático: depois de gravar, manda regenerar as páginas para o
 * número novo aparecer sem deploy. O WhatsApp flutuante lista todas as
 * regiões e vive no layout, então a regeneração vale para o site inteiro.
 */
export async function POST(req: Request) {
  const usuario = await exigirPapel("admin");
  if (!usuario) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: { slug?: unknown; numero?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const numero = typeof body.numero === "string" ? body.numero.trim() : "";
  if (!SLUGS.has(slug)) {
    return NextResponse.json({ erro: "Região desconhecida." }, { status: 400 });
  }
  // Vazio é válido: significa "volta a usar o número do arquivo".
  if (numero && !linkWhatsapp(numero)) {
    return NextResponse.json(
      { erro: "Informe um número com DDD, ex.: (65) 99999-0000." },
      { status: 400 },
    );
  }

  try {
    await salvarWhatsappRegiao(slug, numero, usuario.nome);
  } catch (e) {
    console.error("[regioes] falha ao salvar:", e);
    return NextResponse.json(
      { erro: "Não foi possível salvar. Tente novamente." },
      { status: 500 },
    );
  }

  await registrarAcesso("alterou_regiao", {
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    detalhe: numero
      ? `${slug}: WhatsApp atualizado`
      : `${slug}: WhatsApp removido`,
  });

  revalidatePath("/", "layout");

  return NextResponse.json({
    ok: true,
    link: numero ? linkWhatsapp(numero) : null,
  });
}
