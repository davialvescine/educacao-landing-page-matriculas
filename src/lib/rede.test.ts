import { describe, expect, it } from "vitest";
import {
  cidadeDaUnidade,
  getEscola,
  getEstados,
  getRegiaoSite,
  getRegioesSite,
  nomeEscola,
  resolverRegiaoInterna,
  slugEscola,
  whatsappDaEscola,
  type Escola,
  type Estado,
} from "@/lib/rede";
import { linkWhatsapp } from "@/lib/site";

/**
 * As regras que, se quebrarem, mandam a família para a equipe errada ou
 * entregam um botão que não funciona. São silenciosas: nada estoura, o
 * lead só chega no lugar errado.
 */

describe("regiões do site", () => {
  it("apresenta cinco regiões, com o Mato Grosso unificado", () => {
    const slugs = getRegioesSite().map((e) => e.slug);
    expect(slugs).toContain("mato-grosso");
    expect(slugs).not.toContain("leste-mt");
    expect(slugs).not.toContain("oeste-mt");
    expect(slugs).toHaveLength(5);
  });

  it("mantém as seis associações por dentro, que é o recorte do painel", () => {
    const internos = getEstados().map((e) => e.slug);
    expect(internos).toContain("leste-mt");
    expect(internos).toContain("oeste-mt");
    expect(internos).toHaveLength(6);
  });

  it("junta na página do Mato Grosso as unidades das duas associações", () => {
    const mt = getRegiaoSite("mato-grosso");
    expect(mt).toBeDefined();
    const origens = new Set(mt!.escolas.map((s) => s.associacao_slug));
    expect(origens).toEqual(new Set(["leste-mt", "oeste-mt"]));
    expect(mt!.escolas).toHaveLength(9);
  });

  it("resolve a URL de unidade do Mato Grosso pelo slug novo", () => {
    const achado = getEscola("mato-grosso", "colegio-adventista-do-cpa");
    expect(achado?.escola).toBeDefined();
    expect(achado?.estado.slug).toBe("mato-grosso");
  });
});

describe("roteamento do lead para a associação certa", () => {
  it("manda unidade de Cuiabá para a ALM e de Sinop para a AOM", () => {
    expect(
      resolverRegiaoInterna("mato-grosso", "Colégio Adventista do CPA")?.slug,
    ).toBe("leste-mt");
    expect(
      resolverRegiaoInterna("mato-grosso", "Colégio Adventista de Sinop")?.slug,
    ).toBe("oeste-mt");
  });

  it("aceita tanto o nome oficial quanto o nome curto da base", () => {
    // O formulário manda o oficial; uma edição no rede.json não pode
    // derrubar o roteamento.
    expect(
      resolverRegiaoInterna("mato-grosso", "Colégio Adventista Sinop")?.slug,
    ).toBe("oeste-mt");
    expect(
      resolverRegiaoInterna("mato-grosso", "Colégio Adventista de Sinop")?.slug,
    ).toBe("oeste-mt");
  });

  it("sem escola, o Mato Grosso não tem dono: recusa", () => {
    expect(resolverRegiaoInterna("mato-grosso", "")).toBeUndefined();
    expect(resolverRegiaoInterna("mato-grosso", "Escola Inexistente")).toBeUndefined();
  });

  it("região não agrupada devolve ela mesma, com ou sem escola", () => {
    expect(resolverRegiaoInterna("goias", "")?.slug).toBe("goias");
    expect(resolverRegiaoInterna("iabc", "")?.slug).toBe("iabc");
  });
});

describe("WhatsApp de cada unidade", () => {
  const mt = () => getRegiaoSite("mato-grosso")!;
  const acharNoMt = (trecho: string) =>
    mt().escolas.find((s) => nomeEscola(s).includes(trecho))!;

  it("todo link renderizável é um wa.me, nunca telefone cru", () => {
    // O rede.json guarda "(65) 99360-3279"; como href isso vira caminho
    // relativo e o clique não vai a lugar nenhum.
    for (const regiao of getRegioesSite()) {
      for (const escola of regiao.escolas) {
        const link = whatsappDaEscola(escola, regiao);
        if (link) expect(link).toMatch(/^https:\/\/wa\.me\/\d+/);
      }
    }
  });

  it("a unidade com número próprio usa o dela, não o da associação", () => {
    const centroAmerica = acharNoMt("Centro América");
    const link = whatsappDaEscola(centroAmerica, mt());
    expect(link).toBe(linkWhatsapp("(65) 99360-3279"));
  });

  it("não empresta o número da associação vizinha dentro do mesmo grupo", () => {
    // Uma unidade da ALM sem número não pode cair no número da AOM: a
    // família de Cuiabá falaria com a equipe do Oeste.
    const semNumero: Escola = {
      nome: "Unidade Fictícia",
      endereco: null,
      foto: null,
      associacao_slug: "leste-mt",
    };
    expect(whatsappDaEscola(semNumero, mt())).toBeNull();
  });

  it("em região não agrupada, a unidade sem número usa o da região", () => {
    const goias = getRegiaoSite("goias")!;
    const semNumero: Escola = { nome: "X", endereco: null, foto: null };
    expect(whatsappDaEscola(semNumero, goias)).toBe(goias.whatsapp.link);
  });
});

describe("linkWhatsapp", () => {
  it("transforma telefone escrito para humano em link", () => {
    expect(linkWhatsapp("(65) 99360-3279")).toBe("https://wa.me/5565993603279");
  });
  it("não duplica o DDI de quem já tem 55", () => {
    expect(linkWhatsapp("55 62 99409-4449")).toBe("https://wa.me/5562994094449");
  });
  it("devolve o link intacto se já for um", () => {
    expect(linkWhatsapp("https://wa.me/556599421370")).toBe("https://wa.me/556599421370");
  });
  it("recusa o que não é telefone", () => {
    expect(linkWhatsapp("")).toBeNull();
    expect(linkWhatsapp(null)).toBeNull();
    expect(linkWhatsapp("1234")).toBeNull();
  });
});

describe("cidade da unidade", () => {
  const porNome = (trecho: string): Escola =>
    getEstados()
      .flatMap((e) => e.escolas)
      .find((s) => nomeEscola(s).includes(trecho))!;

  it("lê do endereço, não do nome — o nome traz o bairro", () => {
    expect(cidadeDaUnidade(porNome("Setor Pedro Ludovico"))).toBe("Goiânia");
    expect(cidadeDaUnidade(porNome("Taguatinga"))).toBe("Brasília");
  });

  it("aguenta endereço sem traço antes da UF", () => {
    expect(cidadeDaUnidade(porNome("Planaltina"))).toBe("Planaltina");
  });

  it("aguenta endereço sem UF nenhuma, caindo no trecho antes do CEP", () => {
    expect(cidadeDaUnidade(porNome("Valparaíso"))).toBe("Valparaíso de Goiás");
  });

  it("nenhuma das 39 unidades fica sem cidade", () => {
    const semCidade = getEstados()
      .flatMap((e) => e.escolas)
      .filter((s) => !cidadeDaUnidade(s))
      .map(nomeEscola);
    expect(semCidade).toEqual([]);
  });
});

describe("slugs das unidades", () => {
  it("não repete slug dentro de uma mesma região", () => {
    for (const regiao of getRegioesSite()) {
      const slugs = regiao.escolas.map(slugEscola);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("toda unidade é alcançável pela própria URL", () => {
    for (const regiao of getRegioesSite()) {
      for (const escola of regiao.escolas) {
        const achado = getEscola(regiao.slug, slugEscola(escola));
        expect(achado, `${nomeEscola(escola)} em /${regiao.slug}`).toBeDefined();
      }
    }
  });
});

describe("integridade dos dados da rede", () => {
  it("a soma das unidades bate com o número anunciado no site", () => {
    const total = getRegioesSite().reduce((n, e) => n + e.escolas.length, 0);
    expect(total).toBe(39);
  });

  it("toda associação tem nome e sigla", () => {
    for (const e of getEstados() as Estado[]) {
      expect(e.nome, e.slug).toBeTruthy();
      expect(e.associacao, e.slug).toBeTruthy();
    }
  });
});
