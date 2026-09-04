import { describe, expect, it } from "vitest";
import { ehSlugDeProjeto, getProjeto, PROJETOS, PROJETO_PADRAO } from "@/lib/projetos";

/**
 * O painel recebe lead de dois projetos. Confundir a origem faz o lead
 * aparecer na tela errada e contar na estatística errada.
 */
describe("registro de projetos", () => {
  it("o site de matrículas é o projeto padrão e não é externo", () => {
    expect(PROJETO_PADRAO.slug).toBe("matriculas");
    expect(PROJETO_PADRAO.externo).toBe(false);
  });

  it("o Educação dos Sonhos é externo: vive em outro repositório", () => {
    const eds = getProjeto("educacao-dos-sonhos");
    expect(eds?.externo).toBe(true);
    expect(eds?.dominio).toBe("educacaodossonhos.com.br");
  });

  it("não há slug repetido", () => {
    const slugs = PROJETOS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("aceita só os slugs conhecidos", () => {
    expect(ehSlugDeProjeto("matriculas")).toBe(true);
    expect(ehSlugDeProjeto("educacao-dos-sonhos")).toBe(true);
    expect(ehSlugDeProjeto("qualquer-coisa")).toBe(false);
    expect(ehSlugDeProjeto(null)).toBe(false);
  });
});
