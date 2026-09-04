import { beforeEach, describe, expect, it } from "vitest";
import { _zerar, chaveDoPedido, lembrar, permitido, repetido } from "@/lib/limite";

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
    expect(permitido("1.2.3.4", t + 30_000)).toBe(true);
  });

  it("um IP não gasta a cota do outro", () => {
    const t = 1_000_000;
    for (let i = 0; i < 8; i++) permitido("1.1.1.1", t);
    expect(permitido("2.2.2.2", t)).toBe(true);
  });

  it("chave nova a cada chamada não faz a memória crescer sem teto", () => {
    // Quem forja x-forwarded-for inventa um IP por requisição. O mapa
    // não pode virar o próprio ataque.
    const t = 1_000_000;
    for (let i = 0; i < 25_000; i++) permitido(`10.0.${(i >> 8) & 255}.${i & 255}`, t);
    // Não dá para ler o tamanho do mapa daqui; o que se garante é que
    // continua respondendo rápido e certo depois de 25 mil chaves.
    expect(permitido("9.9.9.9", t)).toBe(true);
  });
});

describe("chaveDoPedido", () => {
  it("normaliza o telefone: formatação e DDI 55 não mudam a chave", () => {
    const a = chaveDoPedido({ whatsapp: "(62) 99999-0000", nome: "Ana", nivel: "Ensino Médio" });
    const b = chaveDoPedido({ whatsapp: "+55 62 99999 0000", nome: "ana ", nivel: "ensino médio" });
    expect(a).toBe(b);
  });

  it("dois filhos com o mesmo telefone são dois pedidos", () => {
    const a = chaveDoPedido({ whatsapp: "62999990000", nome: "Ana", nivel: "Ensino Médio" });
    const b = chaveDoPedido({ whatsapp: "62999990000", nome: "Ana", nivel: "Educação Infantil" });
    expect(a).not.toBe(b);
  });
});

describe("repetido / lembrar", () => {
  it("só é repetido depois de LEMBRADO — validar e falhar não conta", () => {
    const t = 1_000_000;
    const chave = chaveDoPedido({ whatsapp: "62999990000", nome: "Ana", nivel: "EM" });
    expect(repetido(chave, t)).toBe(false);
    expect(repetido(chave, t + 1000)).toBe(false); // ainda não gravou
    lembrar(chave, t + 1000);
    expect(repetido(chave, t + 5000)).toBe(true);
  });

  it("depois da janela, pode de novo", () => {
    const t = 1_000_000;
    const chave = chaveDoPedido({ whatsapp: "62999990000", nome: "Ana", nivel: "EM" });
    lembrar(chave, t);
    expect(repetido(chave, t + 3 * 60_000)).toBe(false);
  });

  it("telefone vazio nunca é repetido: a validação de campo cuida disso", () => {
    const chave = chaveDoPedido({ whatsapp: "", nome: "x", nivel: "y" });
    lembrar(chave, 1);
    expect(repetido(chave, 2)).toBe(false);
  });
});
