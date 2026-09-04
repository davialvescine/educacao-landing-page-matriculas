import {
  cidadeDaUnidade,
  nomeEscola,
  type Escola,
  type Estado,
} from "@/lib/rede";

/**
 * Perguntas e respostas por região e por unidade — a parte de AEO do projeto.
 *
 * O texto aparece na página E é repetido em JSON-LD (FAQPage): o buscador só
 * aceita marcação que bate com o conteúdo visível. Respostas curtas, entre 40
 * e 60 palavras, que é a faixa que costuma ser recortada como resposta direta.
 *
 * Nada aqui afirma valor, horário ou série oferecida: esses dados variam por
 * unidade e não estão na base. Onde a resposta honesta é "depende", ela manda
 * a família falar com a equipe, em vez de inventar um número.
 */

export interface Pergunta {
  p: string;
  r: string;
}

/** Lista de cidades da região, sem repetir, em ordem alfabética. */
export function cidadesDaRegiao(estado: Estado): string[] {
  const cidades = estado.escolas
    .map(cidadeDaUnidade)
    .filter((c): c is string => Boolean(c));
  return [...new Set(cidades)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Endereços da base têm vírgula dobrada e espaço sobrando em várias unidades. */
function enderecoLimpo(endereco: string): string {
  return endereco
    .replace(/\s*,\s*(,\s*)+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,\s*$/, "")
    .trim();
}

/** Enumeração legível: "a, b e c". */
function listar(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

export function perguntasRegiao(estado: Estado): Pergunta[] {
  const cidades = cidadesDaRegiao(estado);
  const total = estado.escolas.length;
  const unidades = total === 1 ? "uma unidade" : `${total} unidades`;

  return [
    {
      p: `Em quais cidades ${estado.nome} tem escola adventista?`,
      r: cidades.length
        ? `A Educação Adventista tem ${unidades} em ${estado.nome}, ${cidades.length === 1 ? "na cidade de" : "nas cidades de"} ${listar(cidades)}. Todas atendem famílias de qualquer religião e seguem a mesma proposta pedagógica da rede.`
        : `A Educação Adventista tem ${unidades} em ${estado.nome}. Fale com a nossa equipe para saber qual fica mais perto de você.`,
    },
    {
      p: `Quanto custa a mensalidade de uma escola adventista em ${estado.nome}?`,
      r: `Os valores variam por unidade e por série, então não existe uma tabela única para ${estado.nome}. Peça contato pelo formulário desta página: a equipe envia a tabela da unidade que você escolher, com as condições de pagamento e os descontos vigentes, sem compromisso.`,
    },
    {
      p: `Preciso ser adventista para matricular meu filho em ${estado.nome}?`,
      r: `Não. A maioria das famílias da rede não é adventista. As unidades de ${estado.nome} recebem alunos de todas as crenças: o que a escola oferece é ensino de qualidade com valores cristãos, respeitando a fé de cada família.`,
    },
    {
      p: `Como faço a matrícula numa escola adventista em ${estado.nome}?`,
      r: `Preencha o formulário desta página com a unidade de interesse. A equipe ${estado.whatsapp.link ? "chama você no WhatsApp" : "entra em contato"} para tirar dúvidas, agendar uma visita e concluir a matrícula. Os documentos usuais são RG e CPF do responsável, certidão de nascimento do aluno, histórico escolar e comprovante de residência.`,
    },
    {
      p: `A escola adventista tem aula aos sábados?`,
      r: `Não. As aulas regulares acontecem de segunda a sexta-feira, nas unidades de ${estado.nome} e no restante da rede.`,
    },
  ];
}

export function perguntasEscola(escola: Escola, estado: Estado): Pergunta[] {
  const nome = nomeEscola(escola);
  const cidade = cidadeDaUnidade(escola);
  const emCidade = cidade ? ` em ${cidade}` : "";

  return [
    {
      p: `Onde fica ${nome}?`,
      r: escola.endereco
        ? `${nome} fica em ${enderecoLimpo(escola.endereco)}. Para agendar uma visita e conhecer a estrutura por dentro, fale com a equipe da unidade pelo WhatsApp.`
        : `${nome} faz parte da Educação Adventista${emCidade ? ` ${emCidade}` : ""}. Fale com a nossa equipe para receber o endereço completo e agendar uma visita.`,
    },
    {
      p: `Quanto custa a mensalidade d${/^escola\b/i.test(nome) ? "a" : "o"} ${nome}?`,
      r: `Os valores variam conforme a série e a época da matrícula, e as condições são definidas pela própria unidade. Peça contato pelo formulário desta página: você recebe a tabela atualizada, as formas de pagamento e os descontos disponíveis, sem compromisso.`,
    },
    {
      p: `Como agendar uma visita${emCidade ? ` à unidade${emCidade}` : ""}?`,
      r: `Preencha o formulário desta página ou chame a equipe no WhatsApp. A visita é marcada no horário que der para a sua família, e dá para conhecer as salas, conversar com a coordenação e tirar dúvidas sobre a rotina antes de decidir.`,
    },
    {
      p: `Precisa ser adventista para estudar${emCidade ? ` ${emCidade}` : ""}?`,
      r: `Não. A maioria das famílias da rede não é adventista. ${nome} recebe alunos de todas as crenças, com respeito à fé de cada família, e a proposta é a mesma da rede: ensino de qualidade com valores cristãos.`,
    },
    {
      p: `Quais séries ${nome} atende?`,
      r: `A Educação Adventista atende da Educação Infantil ao Ensino Médio, mas a oferta de cada etapa varia por unidade. Confirme com a equipe${emCidade ? ` ${emCidade}` : " da unidade"} quais séries estão disponíveis para o ano letivo de 2027.`,
    },
  ];
}
