import { beforeEach, describe, expect, it } from "vitest";
import { _zerar, permitido, repetido } from "@/lib/limite";

beforeEach(() => _zerar());

describe("permitido", () => {
  it("deixa passar as primeiras e segura a enxurrada", () => {
    const t = 1_000_000;
    const respostas = Array.from({ length: 10 }, () => permitido("1.2.3.4", t));
    expect(respostas.filter(Boolean).length).toBe(8);
    expect(respostas.slice(8)).toEqual([false, false]);
  });

  it("repõe com o tempo, em vez de bloquear para sempre", () => {
    const t = 1_000_000;
    for (let i = 0; i < 8; i++) permitido("1.2.3.4", t);
    expect(permitido("1.2.3.4", t)).toBe(false);
    // Meio minuto depois, metade das fichas voltou.
    expect(permitido("1.2.3.4", t + 30_000)).toBe(true);
  });

  it("um IP não gasta a cota do outro", () => {
    const t = 1_000_000;
    for (let i = 0; i < 8; i++) permitido("1.1.1.1", t);
    expect(permitido("2.2.2.2", t)).toBe(true);
  });
});

describe("repetido", () => {
  it("o mesmo telefone em poucos minutos é a mesma família", () => {
    const t = 1_000_000;
    expect(repetido("(62) 99999-0000", t)).toBe(false);
    expect(repetido("62999990000", t + 5_000)).toBe(true); // formatação diferente, mesmo número
  });

  it("depois da janela, pode de novo", () => {
    const t = 1_000_000;
    repetido("62999990000", t);
    expect(repetido("62999990000", t + 11 * 60_000)).toBe(false);
  });

  it("telefone vazio nunca é 'repetido': a validação de campo cuida disso", () => {
    expect(repetido("", 1)).toBe(false);
  });
});
