@AGENTS.md

# Site de Matrículas 2027 — Educação Adventista Centro-Oeste

Captação de matrículas para seis associações da rede adventista no
Centro-Oeste, mais o internato IABC. Arquitetura em `docs/arquitetura.md`;
estado comercial da entrega em `docs/estado-de-entrega.md`.

## Quem lê o que você escreve

Duas plateias, e elas não se misturam.

**A família** vê o site público. Fala português comum. Nunca vê sigla
interna (ABC, ALM, APl), nunca vê "lead", nunca vê nome de associação.
Diz "Educação Adventista de Goiás", não "Associação Goiana".
`nomeRegiaoParaFamilia()` existe para isso.

**A coordenação** vê o painel. Aí sim: região interna, status de webhook,
associação. Continua em português, sem jargão de programador.

## Como o código é escrito

**Comentário explica *por quê*, nunca *o quê*.** `// incrementa i` não
entra. `// A carga acima do limite do NOTIFY derrubaria a transação que
gravou o lead. Perder o aviso é aceitável; perder o lead não é.` entra.
Comentário que só repete o código é ruído; comentário que guarda uma
decisão poupa a próxima pessoa de refazê-la errado.

**Português em tudo:** nome de variável, função, coluna, commit,
comentário. `atendenteNome`, não `attendantName`.

**Nada some da tela.** Animação de entrada esconde conteúdo? Então
esconde em tempo de execução, com rede de segurança por tempo. Conteúdo
invisível é pior que animação nenhuma — e sem JS o texto tem de aparecer.

**`IntersectionObserver`, nunca `addEventListener("scroll")`.** Scroll
dispara a cada quadro e trava no celular.

**Falha não derruba o principal.** Envio ao CRM falhou? Vira estado no
banco e é reprocessado; o usuário já recebeu resposta. Auditoria falhou?
Loga e segue — auditoria que derruba a operação auditada é pior que
auditoria nenhuma.

## Testes

Vitest, ambiente `node`, **só lógica pura**. Não há teste de componente
nem de rota. O que se testa: mapeamento de região, leitura de cabeçalho,
formatação, regra de visibilidade. Se precisar de banco ou de DOM para
testar, provavelmente a lógica está no lugar errado — tire de dentro da
rota e ponha em `src/lib/`.

    npx vitest run

## Antes de subir — portão obrigatório, nesta ordem

**1. CI local.** Não é sugestão. Nada é empurrado sem passar.

    npm run ci

Roda tipos, testes, build e a sintaxe do serviço de tempo real, e não
para no primeiro erro — devolve a lista inteira. O build é obrigatório
porque as páginas de escola são geradas nele: dado ruim não aparece em
`npm run dev`, só estoura lá.

**2. Revisão com o Codex.** Todo trabalho passa por revisão antes do
push. Segunda leitura pega o que quem escreveu não enxerga: já achou
fail-open em resolução de host neste projeto, e falha silenciosa é
exatamente o que não aparece nos testes.

Mande o diff e peça revisão adversarial — não "está bom?", e sim "onde
isto quebra". Se apontar algo real, conserte e rode o CI de novo.

**3. Só então** `git push` e PR.

Um passo que falha invalida os seguintes. CI vermelho não vai para
revisão; revisão com apontamento aberto não vira PR.

## Banco

Fonte única: `db/schema.sql`. Toda mudança entra como `CREATE TABLE IF
NOT EXISTS` ou `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, para o arquivo
poder rodar de novo em banco que já existe.

`db/migrar.mjs` roda em ensaio por padrão e só executa com `--aplicar`,
dentro de transação. **Coluna nova exige entrada em `EXIGE_COLUNA`**,
senão o ensaio diz "nada pendente" para banco atrasado — já aconteceu.

## Git

Uma branch por assunto, cortada de `main` — não de outra branch de
trabalho, senão elas empilham e uma não pode ser mesclada sem a outra
(já aconteceu). Mensagem de commit em português, explicando a decisão e
não o diff: o que estava errado, por que a solução é essa, o que foi
descartado.

Não empurre nem abra PR sem o cliente pedir, e nunca antes do portão
acima.

## O que é responsabilidade da união, não nossa

Redação jurídica final da política de privacidade, razão social, e o
parecer do § 11 do orçamento. Na página, lacuna assim fica **marcada e
visível** — nunca preenchida com frase inventada.
