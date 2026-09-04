import FaqBloco from "@/components/FaqBloco";
import type { Pergunta } from "@/lib/faq";

/**
 * Perguntas reais que os pais pesquisam antes de escolher um colégio
 * adventista. Respostas honestas: valores e condições variam por unidade,
 * então o CTA leva sempre ao WhatsApp da região.
 */
const PERGUNTAS: Pergunta[] = [] = [
  {
    p: "Meu filho precisa ser adventista para estudar na escola?",
    r: "Não. A maioria das famílias da rede não é adventista. Todos são bem-vindos: o que oferecemos é uma educação de qualidade com valores cristãos que servem para a vida toda, com respeito à fé de cada família.",
  },
  {
    p: "Tem aula aos sábados?",
    r: "Não há aulas regulares aos sábados. A programação da escola acontece de segunda a sexta-feira.",
  },
  {
    p: "Quanto custa a mensalidade?",
    r: "Os valores variam conforme a unidade e a série do aluno. Preencha o formulário ou chame a equipe da sua região no WhatsApp: você recebe a tabela completa, as condições de pagamento e os descontos disponíveis sem compromisso.",
  },
  {
    p: "Como é o método pedagógico da Educação Adventista?",
    r: "A proposta é de formação integral: conhecimento acadêmico forte aliado ao desenvolvimento físico, emocional e espiritual. A rede tem material didático próprio, tecnologia em sala de aula e 130 anos de experiência no Brasil.",
  },
  {
    p: "O ensino prepara para o ENEM e vestibulares?",
    r: "Sim. O Ensino Médio tem foco em preparação para o ENEM e os principais vestibulares, com simulados, orientação de estudos e projeto de vida para ajudar o aluno a escolher a carreira.",
  },
  {
    p: "Tem período integral ou contraturno?",
    r: "Várias unidades oferecem período estendido e atividades no contraturno, como robótica, música e esportes. A disponibilidade varia por unidade: consulte a equipe da escola mais próxima.",
  },
  {
    p: "Tem bolsa de estudo ou desconto?",
    r: "As condições comerciais, descontos para irmãos e campanhas de matrícula variam por unidade e época do ano. Fale com a equipe da sua região no WhatsApp para conhecer as condições vigentes.",
  },
  {
    p: "Como é o ensino religioso no dia a dia?",
    r: "Os valores cristãos fazem parte da rotina de forma natural: momentos devocionais, projetos de solidariedade e uma cultura de respeito, empatia e propósito, sempre acolhendo alunos de todas as crenças.",
  },
  {
    p: "Como faço a matrícula?",
    r: "É simples: preencha o formulário desta página, e a equipe da unidade escolhida chama você no WhatsApp para agendar uma visita e concluir a matrícula. Os documentos usuais são RG e CPF do responsável, certidão de nascimento do aluno, histórico ou declaração escolar e comprovante de residência.",
  },
];

export default function FaqSection() {
  return (
    <FaqBloco
      perguntas={PERGUNTAS}
      titulo="O que os pais mais perguntam"
      chamada="Respostas diretas para você decidir com tranquilidade. Ficou alguma dúvida? Chame a gente no WhatsApp."
    />
  );
}
