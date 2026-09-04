import { describe, expect, it } from "vitest";
import { getVersao, VERSAO_ATUAL, VERSOES } from "@/lib/consentimento";

/**
 * O consentimento é a única prova que a rede tem se alguém questionar o
 * uso dos dados. Um erro aqui não quebra nada em tela: só aparece quando
 * for tarde.
 */
describe("versões do consentimento", () => {
  it("não repete número de versão", () => {
    const v = VERSOES.map((x) => x.versao);
    expect(new Set(v).size).toBe(v.length);
  });

  it("a versão atual é a última da lista", () => {
    expect(VERSAO_ATUAL).toBe(VERSOES[VERSOES.length - 1]);
  });

  it("toda versão tem resumo e texto completo", () => {
    for (const v of VERSOES) {
      expect(v.resumo.length, v.versao).toBeGreaterThan(20);
      expect(v.texto.length, v.versao).toBeGreaterThan(120);
    }
  });

  it("recusa versão desconhecida", () => {
    // É o que impede alguém de forjar um aceite mandando uma versão
    // qualquer no corpo da requisição.
    expect(getVersao("1999-01-1")).toBeUndefined();
    expect(getVersao("")).toBeUndefined();
    expect(getVersao(VERSAO_ATUAL.versao)).toBeDefined();
  });

  it("o texto atende ao que a lei exige dizer", () => {
    const t = VERSAO_ATUAL.texto.toLowerCase();
    // art. 8º §4º: finalidade específica, não autorização genérica
    expect(t).toMatch(/matr[íi]cula/);
    // art. 9º: quem é o controlador e com quem os dados são compartilhados
    expect(t).toMatch(/educa[çc][ãa]o adventista/);
    expect(t).toMatch(/compartilh/);
    // art. 8º §5º: revogação a qualquer momento e sem custo
    expect(t).toMatch(/qualquer momento/);
    expect(t).toMatch(/sem custo/);
  });

  it("fala dos dados de quem preenche, não de dados da criança", () => {
    // O formulário coleta nome, WhatsApp e e-mail do adulto. Prometer no
    // texto um tratamento de dado de criança que não acontece cria
    // obrigação inexistente e confunde quem for auditar.
    const t = VERSAO_ATUAL.texto.toLowerCase();
    expect(t).toMatch(/o meu nome/);
    expect(t).not.toMatch(/da crian[çc]a/);
  });
});
