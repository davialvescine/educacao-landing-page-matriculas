import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VERSAO_ATUAL } from "@/lib/consentimento";
import { SITE_NOME, SITE_URL } from "@/lib/site";

/**
 * Política de privacidade deste site.
 *
 * Escrita a partir do que o sistema faz de fato, não de modelo genérico:
 * cada linha abaixo corresponde a código que existe. Se o comportamento
 * mudar, esta página muda junto, senão ela deixa de ser verdadeira e
 * passa a ser um risco em vez de uma proteção.
 *
 * O QUE AINDA É DE OUTRA PESSOA: a razão social exata do CNPJ, que é da
 * união, e a revisão jurídica do texto inteiro, que é do departamento
 * dela (§ 11 do orçamento). O resto está preenchido.
 *
 * Medir sem aviso de cookies é decisão do cliente, tomada em 04/09/2026:
 * a campanha precisa da medição cheia e a analítica se apoia em legítimo
 * interesse. Em troca, esta página declara isso na cara e oferece o
 * caminho para quem não quiser ser medido — é o que sustenta essa base.
 * Se a união voltar atrás, o banner entra por cima, sem mexer no resto.
 */

const ATUALIZADA_EM = "4 de setembro de 2026";

/** Canal do encarregado de dados da rede (art. 41 da LGPD). */
const EMAIL_PRIVACIDADE = "privacidade@adventistas.org";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Educação Adventista Centro-Oeste trata os dados informados no formulário de matrículas: o que é coletado, para quê, com quem é compartilhado e como exercer seus direitos.",
  alternates: { canonical: `${SITE_URL}/politica-de-privacidade` },
};

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-xl font-extrabold tracking-tight text-brand-950 sm:text-2xl">
        {titulo}
      </h2>
      <div className="mt-4 flex flex-col gap-4 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PoliticaPage() {
  return (
    <>
      <Header solido />
      <main className="bg-paper">
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-6">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter text-brand-950 sm:text-5xl">
            Política de Privacidade
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Esta página explica o que acontece com os dados que você informa
            no formulário de matrículas deste site. Ela descreve o que o
            sistema faz de fato, e não um texto genérico.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Atualizada em {ATUALIZADA_EM} · versão do aceite em vigor:{" "}
            {VERSAO_ATUAL.versao}
          </p>

          <div className="mt-14 flex flex-col gap-10">
            <Secao titulo="Quem trata os seus dados">
              <p>
                O controlador dos dados é a {SITE_NOME}, CNPJ
                60.833.910/0001-87, com sede na SGAN Quadra 608, Módulo B,
                Via L3 — Asa Norte, Brasília (DF), CEP 70830-352.
              </p>
              <p className="text-sm">
                A razão social registrada nesse CNPJ precisa aparecer aqui do
                jeito que está no cartão: <em>{SITE_NOME}</em> é o nome da
                rede, não necessariamente o nome jurídico da entidade.
              </p>
              <p>
                Cada uma das seis associações da rede trata os dados das
                famílias da própria região, na condição de controladora
                conjunta, para atender a matrícula na unidade escolhida.
              </p>
            </Secao>

            <Secao titulo="O que coletamos, e por quê">
              <p>
                Só o que é necessário para entrar em contato sobre a matrícula.
                Não pedimos documento, data de nascimento nem dados da criança
                que a identifiquem.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  ["Nome", "para saber com quem estamos falando"],
                  ["WhatsApp", "é por onde a equipe da unidade responde"],
                  ["E-mail, se você informar", "para enviar a confirmação do cadastro"],
                  ["Região e escola de interesse", "para o pedido chegar à equipe certa"],
                  ["Série pretendida", "para a conversa começar já no ponto certo"],
                ].map(([dado, motivo]) => (
                  <li key={dado} className="flex flex-col border-l-2 border-gold-300 pl-4">
                    <span className="font-semibold text-brand-950">{dado}</span>
                    <span className="text-sm">{motivo}</span>
                  </li>
                ))}
              </ul>
              <p>
                Registramos também de qual anúncio ou busca você chegou, quando
                vier por um link de campanha, para saber o que funciona. E, no
                momento em que você envia o formulário, guardamos a data, a hora,
                o seu endereço de IP e o navegador usado, junto da versão exata do
                texto que você aceitou. Isso existe por uma razão: a lei exige que
                nós provemos que houve consentimento, e sem esse registro não
                haveria como.
              </p>
            </Secao>

            <Secao titulo="Com quem compartilhamos">
              <p>
                <strong className="text-brand-950">
                  Com a associação responsável pela unidade que você escolheu.
                </strong>{" "}
                É ela quem atende a sua família.
              </p>
              <p>
                <strong className="text-brand-950">
                  Com as ferramentas que a rede usa para fazer esse contato
                </strong>
                , que organizam as conversas da coordenação com as famílias.
                Elas trabalham a mando da rede e só para essa finalidade.
              </p>
              <p>
                Usamos ainda Google Analytics e Meta Pixel para medir o
                desempenho das campanhas. Eles registram a navegação de forma
                agregada, sem ligar essa navegação ao seu nome, e essa medição
                começa quando a página abre — este site não exibe aviso de
                cookies.
              </p>
              <p>
                Se você não quiser ser medido, dá para bloquear cookies nas
                configurações do seu navegador ou instalar o{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-950 underline underline-offset-4 decoration-gold-400 decoration-2"
                >
                  complemento que desativa o Google Analytics
                </a>
                . Isso não atrapalha em nada o seu pedido de matrícula.
              </p>
              <p>
                Não vendemos, alugamos nem cedemos os seus dados para
                publicidade de terceiros.
              </p>
            </Secao>

            <Secao titulo="Por quanto tempo guardamos">
              <p>
                Pelo tempo necessário à finalidade que os coletou: o contato da
                matrícula e o histórico de atendimento da sua família na rede.
                Não há um prazo fixo, e sim um critério — quando a finalidade
                acaba, o dado sai.
              </p>
              <p>
                Você pode pedir a exclusão ou a anonimização a qualquer
                momento. A rede só mantém o que a lei mandar manter: registro
                escolar obrigatório, defesa em processo judicial ou outra
                obrigação legal.
              </p>
              <p>
                O registro do seu consentimento é guardado separadamente e
                sobrevive ao descarte do cadastro, porque ele é a prova de que a
                coleta foi autorizada.
              </p>
            </Secao>

            <Secao titulo="Seus direitos">
              <p>
                A Lei Geral de Proteção de Dados garante que você peça, a
                qualquer momento e sem custo: ver os dados que temos sobre você,
                corrigi-los, pedir uma cópia, apagá-los, saber com quem foram
                compartilhados e retirar a autorização que deu.
              </p>
              <p>
                <strong className="text-brand-950">Como pedir:</strong> responda
                a qualquer mensagem que a rede tenha enviado, por WhatsApp ou
                e-mail, dizendo o que você quer — o pedido chega à coordenação
                da sua região. Ou escreva direto para{" "}
                <a
                  href={`mailto:${EMAIL_PRIVACIDADE}`}
                  className="font-semibold text-brand-950 underline underline-offset-4 decoration-gold-400 decoration-2"
                >
                  {EMAIL_PRIVACIDADE}
                </a>
                .
              </p>
              <p>
                Retirar a autorização não apaga o que já foi feito de forma
                legítima antes do pedido, e pode significar que a rede deixe de
                conseguir falar com você sobre a matrícula.
              </p>
            </Secao>

            <Secao titulo="Segurança">
              <p>
                Os dados ficam em banco de dados com acesso restrito. No painel
                interno, cada pessoa da coordenação vê apenas as regiões que lhe
                foram atribuídas, e toda exportação, reenvio e alteração fica
                registrada, com quem fez e quando.
              </p>
            </Secao>

            <Secao titulo="Como falar sobre privacidade">
              <p>
                O canal do encarregado de dados da rede, que a lei manda
                indicar e divulgar, é o e-mail{" "}
                <a
                  href={`mailto:${EMAIL_PRIVACIDADE}`}
                  className="font-semibold text-brand-950 underline underline-offset-4 decoration-gold-400 decoration-2"
                >
                  {EMAIL_PRIVACIDADE}
                </a>
                . Escreva por ali qualquer dúvida ou reclamação sobre o uso
                dos seus dados.
              </p>
              <p>
                Você também pode procurar a Autoridade Nacional de Proteção de
                Dados se considerar que os seus direitos não foram atendidos.
              </p>
            </Secao>

            <Secao titulo="O texto que você aceita ao enviar o formulário">
              <p className="rounded-card border border-line bg-surface p-5 text-brand-950">
                {VERSAO_ATUAL.texto}
              </p>
              <p className="text-sm">
                Guardamos qual versão deste texto estava no ar quando você
                enviou o formulário, para que seja sempre possível saber o que
                exatamente foi aceito.
              </p>
            </Secao>

            <Secao titulo="Mudanças nesta política">
              <p>
                Se algo mudar no que fazemos com os dados, esta página muda
                junto, e a data de atualização no topo passa a ser a nova.
              </p>
            </Secao>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
