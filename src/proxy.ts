import { NextResponse, type NextRequest } from "next/server";
import { PROJETO_PADRAO, projetoPorHost } from "@/lib/projetos";

/**
 * Roteamento por domínio.
 *
 * A mesma aplicação responde por dois sites. O que decide não é a URL que
 * a pessoa digitou, é o host: educacaodossonhos.com.br entrega a landing
 * do projeto; educaadventistacentrooeste.com.br entrega o de matrículas.
 *
 * Três coisas acontecem aqui, e as três existem para não estragar o que
 * já está no ar:
 *
 *  1. A landing mora em /sonhos por dentro e aparece na raiz do domínio
 *     dela. Assim as duas convivem sem conflito de rota.
 *  2. Cada host serve o próprio robots.txt e sitemap.xml. Um sitemap só
 *     nos dois domínios faria o buscador ver as 46 páginas de matrículas
 *     oferecidas também no domínio da landing — conteúdo duplicado, e um
 *     dos dois perde posição.
 *  3. O painel responde só no domínio principal. O cookie de sessão do
 *     Better Auth é preso a um host; expor a rota em dois lugares não
 *     daria acesso a mais ninguém, mas cria uma porta a mais para
 *     defender, sem nenhum ganho.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const caminho = url.pathname;
  const projeto = projetoPorHost(request.headers.get("host"));

  // Host não autorizado não recebe site nenhum. Servir o principal aqui
  // deixaria o site inteiro acessível por qualquer domínio apontado para
  // a origem, com o buscador lendo isso como conteúdo duplicado.
  if (!projeto) {
    return new NextResponse("Host não autorizado.", { status: 404 });
  }

  if (projeto.slug === PROJETO_PADRAO.slug) {
    // No domínio principal, as rotas internas da landing não existem:
    // deixá-las acessíveis duplicaria o conteúdo em dois endereços.
    const outro = "/sonhos";
    if (caminho === outro || caminho.startsWith(`${outro}/`)) {
      return NextResponse.rewrite(new URL("/nao-encontrado", url));
    }
    return NextResponse.next();
  }

  // Daqui para baixo, o domínio é o da landing.
  if (caminho.startsWith("/painel") || caminho.startsWith("/api/painel")) {
    return NextResponse.rewrite(new URL("/nao-encontrado", url));
  }

  if (caminho === "/robots.txt" || caminho === "/sitemap.xml") {
    return NextResponse.rewrite(new URL(`${projeto.base}${caminho}`, url));
  }

  // A API de leads é compartilhada de propósito: os dois projetos gravam
  // no mesmo banco e caem no mesmo painel.
  if (caminho.startsWith("/api/")) return NextResponse.next();

  if (caminho === projeto.base || caminho.startsWith(`${projeto.base}/`)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(
    new URL(`${projeto.base}${caminho === "/" ? "" : caminho}`, url),
  );
}

export const config = {
  // Arquivos internos do Next e assets não passam por aqui.
  matcher: ["/((?!_next/static|_next/image|imagens|fontes|favicon.ico).*)"],
};
