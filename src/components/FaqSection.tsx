import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { Eyebrow } from "@/components/Secoes";

/**
 * Perguntas reais que os pais pesquisam antes de escolher um colégio
 * adventista. Respostas honestas: valores e condições variam por unidade,
 * então o CTA leva sempre ao WhatsApp da região.
 */
const PERGUNTAS: { p: string; r: string }[] = [
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
    <section
      id="perguntas"
      className="relative scroll-mt-10 overflow-hidden bg-brand-50 [background-image:radial-gradient(ellipse_620px_320px_at_50%_100%,rgba(248,192,56,0.14),transparent_70%)]"
    >
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: PERGUNTAS.map((q) => ({
            "@type": "Question",
            name: q.p,
            acceptedAnswer: { "@type": "Answer", text: q.r },
          })),
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-28">
        <Reveal>
          <Eyebrow>Perguntas frequentes</Eyebrow>
          <h2 className="mt-4 text-center text-4xl font-extrabold tracking-tighter text-brand-900 sm:text-5xl">
            O que os pais mais perguntam
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Respostas diretas para você decidir com tranquilidade. Ficou alguma
            dúvida? Chame a gente no WhatsApp.
          </p>
        </Reveal>
        <div className="mt-12 flex flex-col gap-3">
          {PERGUNTAS.map((q, i) => (
            <Reveal key={q.p} delay={(i % 3) * 0.06}>
              <details className="group rounded-2xl border border-line bg-surface shadow-card transition-shadow open:shadow-card-hover">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-extrabold tracking-tight text-brand-900 [&::-webkit-details-marker]:hidden">
                  {q.p}
                  <ChevronDown
                    aria-hidden
                    className="size-5 shrink-0 text-gold-600 transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {q.r}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
