import { describe, expect, it } from "vitest";
import { agenteDaRequisicao, ipDaRequisicao } from "@/lib/requisicao";

function req(cabecalhos: Record<string, string>): Request {
  return new Request("https://exemplo.test/", { headers: cabecalhos });
}

describe("ipDaRequisicao", () => {
  it("pega o primeiro da cadeia, que é o visitante", () => {
    // Atrás de proxy, o IP do visitante é o primeiro; os seguintes são a
    // infraestrutura. Pegar o último registraria o nosso próprio servidor.
    expect(
      ipDaRequisicao(req({ "x-forwarded-for": "203.0.113.9, 10.0.0.1, 10.0.0.2" })),
    ).toBe("203.0.113.9");
  });

  it("aceita a cadeia sem espaço depois da vírgula", () => {
    expect(ipDaRequisicao(req({ "x-forwarded-for": "203.0.113.9,10.0.0.1" }))).toBe(
      "203.0.113.9",
    );
  });

  it("cai para o cabeçalho da Cloudflare quando não há cadeia", () => {
    expect(ipDaRequisicao(req({ "cf-connecting-ip": "198.51.100.4" }))).toBe(
      "198.51.100.4",
    );
  });

  it("devolve vazio sem cabeçalho nenhum, em vez de quebrar", () => {
    expect(ipDaRequisicao(req({}))).toBe("");
  });

  it("corta o que não cabe na coluna", () => {
    const gigante = "1".repeat(200);
    expect(ipDaRequisicao(req({ "x-forwarded-for": gigante })).length).toBe(45);
  });
});

describe("agenteDaRequisicao", () => {
  it("devolve o navegador declarado", () => {
    expect(agenteDaRequisicao(req({ "user-agent": "Mozilla/5.0" }))).toBe(
      "Mozilla/5.0",
    );
  });

  it("devolve vazio quando o cliente não declara", () => {
    expect(agenteDaRequisicao(req({}))).toBe("");
  });

  it("corta agente absurdo: é campo livre que o cliente escolhe", () => {
    expect(agenteDaRequisicao(req({ "user-agent": "x".repeat(5000) })).length).toBe(
      300,
    );
  });
});
