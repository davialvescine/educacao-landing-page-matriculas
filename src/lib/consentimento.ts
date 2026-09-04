/**
 * Consentimento da família, versionado.
 *
 * A LGPD põe o ônus da prova no controlador: o art. 8º §2º diz que cabe à
 * rede provar que obteve o consentimento, e o §4º anula autorização
 * genérica — o aceite precisa ser para finalidade específica. Guardar só
 * um "aceitou: sim" não prova nada, porque não diz A QUÊ a pessoa disse
 * sim, e o texto do formulário muda com o tempo.
 *
 * Por isso o texto é versionado aqui. O formulário renderiza a versão
 * atual a partir deste arquivo, e o servidor grava a versão junto do
 * aceite. Assim dá para reconstruir, anos depois, a frase exata que
 * aquela família leu.
 *
 * QUEM É O TITULAR: o formulário coleta nome, WhatsApp e e-mail do
 * responsável, informados por ele mesmo. Da criança não se coleta nada
 * que a identifique — só a série pretendida. Isso importa: sem dado
 * pessoal de criança, o art. 14 §1º, que exigiria consentimento do
 * responsável em destaque, não se aplica aqui. O titular é o próprio
 * adulto, consentindo sobre os dados dele.
 *
 * O texto precisa dar conta de três exigências:
 *  · art. 8º §4º  — finalidade específica, não autorização genérica
 *  · art. 9º      — quem é o controlador e com quem os dados são divididos
 *  · art. 8º §5º  — que dá para revogar, de graça e a qualquer momento
 *
 * A redação jurídica final é do departamento da própria união: aqui está
 * a parte que o sistema executa, não o parecer.
 *
 * REGRA: nunca edite o texto de uma versão já publicada. Crie uma versão
 * nova. Editar em cima destrói a prova de quem aceitou a anterior.
 */

export interface VersaoConsentimento {
  versao: string;
  /** Data em que esta redação entrou no ar. */
  desde: string;
  /** O que fica visível ao lado da caixa, sem precisar abrir nada. */
  resumo: string;
  /** A redação completa, que é o que fica registrado como prova. */
  texto: string;
}

export const VERSOES: VersaoConsentimento[] = [
  {
    versao: "2026-09-1",
    desde: "2026-09-04",
    resumo:
      "Autorizo o contato sobre a matrícula com os dados que informei.",
    texto:
      "Autorizo a Educação Adventista do Centro-Oeste a usar o meu nome, o meu WhatsApp " +
      "e o meu e-mail para entrar em contato comigo sobre a matrícula na unidade que " +
      "escolhi, e a compartilhar esses dados com a associação responsável por essa " +
      "unidade e com a ferramenta de atendimento que ela usa. Posso pedir para ver, " +
      "corrigir ou apagar esses dados, ou retirar esta autorização, a qualquer momento " +
      "e sem custo, respondendo a qualquer mensagem da rede.",
  },
];

export const VERSAO_ATUAL = VERSOES[VERSOES.length - 1];

export function getVersao(versao: string): VersaoConsentimento | undefined {
  return VERSOES.find((v) => v.versao === versao);
}
