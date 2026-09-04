import { describe, expect, it, vi } from "vitest";
import {
  ehSlugDeProjeto,
  normalizarHost,
  projetoPorHost,
  projetoPorRota,
  PROJETO_PADRAO,
  urlDoProjeto,
} from "@/lib/projetos";

/**
 * Duas marcas, dois domínios, uma aplicação. Errar aqui significa servir
 * o site errado num domínio — ou pior, oferecer o mesmo conteúdo nos dois
 * endereços, que é o que faz o buscador rebaixar os dois.
 */

describe("qual site cada domínio serve", () => {
  it("reconhece os dois domínios", () => {
    expect(projetoPorHost("educaadventistacentrooeste.com.br")?.slug).toBe("matriculas");
    expect(projetoPorHost("educacaodossonhos.com.br")?.slug).toBe("educacao-dos-sonhos");
  });

  it("ignora www e porta", () => {
    expect(projetoPorHost("www.educacaodossonhos.com.br")?.slug).toBe("educacao-dos-sonhos");
    expect(projetoPorHost("educacaodossonhos.com.br:3000")?.slug).toBe("educacao-dos-sonhos");
    expect(projetoPorHost("WWW.EducacaoDosSonhos.com.BR")?.slug).toBe("educacao-dos-sonhos");
  });

  it("fora de produção, qualquer host serve o site principal", () => {
    // localhost, IP direto, túnel de teste: nada disso pode travar o dev.
    expect(projetoPorHost("localhost:3000")?.slug).toBe(PROJETO_PADRAO.slug);
    expect(projetoPorHost(null)?.slug).toBe(PROJETO_PADRAO.slug);
  });

  it("host desconhecido não recebe site nenhum", () => {
    // Devolver o site principal aqui deixaria ele acessível por qualquer
    // domínio apontado para a origem — conteúdo duplicado aos olhos do
    // buscador, e lead entrando classificado como se fosse de lá.
    const antes = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    return import("@/lib/projetos").then((m) => {
      expect(m.projetoPorHost("dominio-invasor.com")).toBeNull();
      expect(m.projetoPorHost("educacaodossonhos.com.br")?.slug).toBe(
        "educacao-dos-sonhos",
      );
      // E quem precisa seguir mesmo assim tem a versão tolerante.
      expect(m.projetoPorHostOuPadrao("dominio-invasor.com").slug).toBe(
        "matriculas",
      );
      vi.stubEnv("NODE_ENV", antes ?? "test");
    });
  });

  it("só o site principal expõe o painel", () => {
    expect(projetoPorHost("educaadventistacentrooeste.com.br")?.temPainel).toBe(true);
    expect(projetoPorHost("educacaodossonhos.com.br")?.temPainel).toBe(false);
  });
});

describe("qual site cada rota pertence", () => {
  it("as rotas da landing vivem sob o prefixo dela", () => {
    expect(projetoPorRota("/sonhos").slug).toBe("educacao-dos-sonhos");
    expect(projetoPorRota("/sonhos/obrigado").slug).toBe("educacao-dos-sonhos");
  });

  it("o resto pertence ao site de matrículas", () => {
    expect(projetoPorRota("/").slug).toBe("matriculas");
    expect(projetoPorRota("/goias").slug).toBe("matriculas");
    expect(projetoPorRota("/painel").slug).toBe("matriculas");
  });

  it("não confunde rota que apenas começa parecido", () => {
    expect(projetoPorRota("/sonhosdealguem").slug).toBe("matriculas");
  });
});

describe("endereço canônico por site", () => {
  it("cada projeto anuncia o próprio domínio", () => {
    const urls = new Set(
      ["educaadventistacentrooeste.com.br", "educacaodossonhos.com.br"].map((h) =>
        urlDoProjeto(projetoPorHost(h)!),
      ),
    );
    expect(urls).toEqual(
      new Set([
        "https://educaadventistacentrooeste.com.br",
        "https://educacaodossonhos.com.br",
      ]),
    );
  });
});

describe("normalizarHost", () => {
  it("devolve vazio para entrada ausente", () => {
    expect(normalizarHost(undefined)).toBe("");
  });
});

describe("ehSlugDeProjeto", () => {
  it("aceita só os slugs conhecidos", () => {
    expect(ehSlugDeProjeto("matriculas")).toBe(true);
    expect(ehSlugDeProjeto("educacao-dos-sonhos")).toBe(true);
    expect(ehSlugDeProjeto("qualquer-coisa")).toBe(false);
    expect(ehSlugDeProjeto(null)).toBe(false);
  });
});
