import { describe, expect, it } from "vitest";
import {
  dataEmBrasilia,
  faixaDoMes,
  mesAnterior,
  primeiroDiaUtil,
  rotuloCampanha,
  variacao,
} from "@/lib/relatorio";

describe("faixaDoMes", () => {
  it("conta o mês como as pessoas contam: 1 é janeiro", () => {
    const f = faixaDoMes(2026, 1);
    expect(f.inicio.toISOString()).toBe("2026-01-01T03:00:00.000Z");
    expect(f.rotulo).toBe("janeiro de 2026");
  });

  it("o corte é à meia-noite de BRASÍLIA, não do servidor", () => {
    // O container roda em UTC. Um lead das 23h do dia 30 em Brasília é
    // 02h do dia 1 em UTC e caía no mês seguinte.
    const f = faixaDoMes(2026, 9);
    const lead = new Date("2026-10-01T02:00:00Z"); // 30/09 23:00 em Brasília
    expect(lead < f.fim).toBe(true);
    expect(f.fim.toISOString()).toBe("2026-10-01T03:00:00.000Z");
  });

  it("vira o ano em dezembro", () => {
    const f = faixaDoMes(2026, 12);
    expect(f.fim.toISOString()).toBe("2027-01-01T03:00:00.000Z");
  });
});

describe("dataEmBrasilia", () => {
  it("lê o dia de Brasília, não o do processo", () => {
    // 02:00Z do dia 1 ainda é dia 30 às 23h em Brasília.
    expect(dataEmBrasilia(new Date("2026-10-01T02:00:00Z"))).toEqual({
      ano: 2026,
      mes: 9,
      dia: 30,
    });
  });
});

describe("mesAnterior", () => {
  it("volta um mês dentro do ano", () => {
    expect(mesAnterior(2026, 9)).toEqual({ ano: 2026, mes: 8 });
  });
  it("de janeiro volta para dezembro do ano passado", () => {
    expect(mesAnterior(2026, 1)).toEqual({ ano: 2025, mes: 12 });
  });
});

describe("variacao", () => {
  it("calcula a diferença percentual", () => {
    expect(variacao(120, 100)).toBe(20);
    expect(variacao(80, 100)).toBe(-20);
  });

  it("não inventa percentual quando não havia base", () => {
    // Sair de zero para dez é começar, não crescer 1000%.
    expect(variacao(10, 0)).toBeNull();
  });

  it("zero contra zero também não tem percentual", () => {
    expect(variacao(0, 0)).toBeNull();
  });
});

describe("primeiroDiaUtil", () => {
  it("dia 1 útil fica no dia 1", () => {
    // 01/09/2026 é uma terça.
    expect(primeiroDiaUtil(2026, 9)).toBe(1);
  });

  it("sábado empurra para segunda", () => {
    // 01/08/2026 é sábado: o relatório sai no dia 3.
    expect(primeiroDiaUtil(2026, 8)).toBe(3);
  });

  it("domingo empurra para segunda", () => {
    // 01/11/2026 é domingo.
    expect(primeiroDiaUtil(2026, 11)).toBe(2);
  });
});

describe("rotuloCampanha", () => {
  it("junta fonte e campanha, porque fonte sozinha não diz nada", () => {
    expect(rotuloCampanha({ utm_source: "fb", utm_campaign: "matriculas-2027" }))
      .toBe("fb · matriculas-2027");
  });

  it("reconhece clique de anúncio sem utm", () => {
    expect(rotuloCampanha({ gclid: "abc" })).toBe("Google Ads");
    expect(rotuloCampanha({ fbclid: "xyz" })).toBe("Meta Ads");
  });

  it("acesso sem origem tem nome próprio, e não fica em branco", () => {
    expect(rotuloCampanha(null)).toBe("Sem campanha (acesso direto)");
    expect(rotuloCampanha({})).toBe("Sem campanha (acesso direto)");
  });

  it("ignora campo em branco vindo de link mal montado", () => {
    expect(rotuloCampanha({ utm_source: "  ", utm_campaign: "verao" })).toBe("verao");
  });
});
