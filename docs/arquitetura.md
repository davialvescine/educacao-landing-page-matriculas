# Arquitetura

Como o sistema é montado, e **por quê**. O que já está registrado no
código não se repete aqui — este documento guarda as decisões, que é o
que o código não consegue contar sozinho.

---

## O que o sistema faz

Uma família interessada em matricular o filho preenche um formulário. Esse
contato precisa chegar, em segundos, à coordenação da associação certa,
já dentro da ferramenta de atendimento que ela usa no dia a dia.

Seis associações, 39 escolas e um internato. A rede não tem equipe única:
cada associação atende as próprias famílias, e o lead do Mato Grosso não
pode aparecer para a coordenação de Goiás.

---

## Desenho geral

```
                    ┌─────────────────────────────┐
  família ─────────►│  site público (SSG)         │
                    │  home · região · escola     │
                    │  IABC · política            │
                    └──────────────┬──────────────┘
                                   │ POST /api/leads
                                   ▼
                    ┌─────────────────────────────┐        ┌──────────┐
  Educação dos ────►│  Route Handlers (Next, Node)│───────►│ Sevenbee │
  Sonhos (outro     │  /api/leads                 │◄───────│  (CRM)   │
  domínio)          │  /api/painel/*              │webhook └──────────┘
                    │  /api/sevenbee/webhook      │
                    │  /api/auth/[...all]         │───────►  Dica Plus
                    │  /api/tarefas/*             │          (a fazer)
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │  Postgres                   │
                    │  leads · consentimentos     │
                    │  acessos · regioes_config   │
                    │  user · session (Better Auth)│
                    └──────────────┬──────────────┘
                                   │ LISTEN leads_mudou
                                   ▼
                    ┌─────────────────────────────┐
  coordenação ─────►│  serviço de tempo real      │
  (painel)      ⇄   │  Socket.IO, processo à parte│
                    └─────────────────────────────┘
```

---

## As peças

### Site público — gerado no build

Home, seis páginas de região, 39 de escola, IABC e política de
privacidade. Tudo estático (`generateStaticParams`), servido como HTML
pronto. Os dados vêm de `src/data/rede.json`, não de banco: escola não
muda de endereço no meio da campanha, e página estática não cai quando o
Postgres cai.

O Mato Grosso é um caso à parte. Para o Google existe **uma** página
(`/mato-grosso`); por trás, as associações Leste e Oeste continuam
separadas, porque o lead precisa ir para a equipe certa. `src/lib/rede.ts`
faz a tradução nos dois sentidos, e `/leste-mt` e `/oeste-mt` respondem
301 para a página única.

### Backend — Route Handlers, no mesmo processo

Não há serviço separado, e isso é decisão, não omissão. Dez rotas, sem
WebSocket, sem processo longo, sem escala independente. Nest ou Express
aqui seriam mais um processo para operar sem entregar nada que o Route
Handler não entregue. A regra para revisitar isso está em
[Quando separar](#quando-separar-de-verdade).

A lógica mora em `src/lib/*`, não dentro das rotas. Isso é o que permite
testar sem subir servidor — e é o que tornaria a extração barata se um dia
ela fizer sentido.

### Serviço de tempo real — processo à parte, e aqui sim

`tempo-real/`. É a única peça que ganhou processo próprio, por dois
motivos concretos:

1. Route Handler não segura WebSocket: responde e encerra.
2. O guia do Next diz que `output: "standalone"` **não convive** com
   servidor customizado. Embutir Socket.IO num `server.ts` obrigaria a
   largar o standalone e mexer no deploy que já funciona.

As duas metades não se falam por HTTP. O gatilho `leads_avisar_trg`
dispara em qualquer escrita na tabela `leads` e o serviço escuta o canal
`leads_mudou`. Foi de propósito: existem quatro caminhos de escrita
(formulário, webhook do Sevenbee, fila de reenvio, UPDATE na mão) e a
aplicação esqueceria um.

Se o serviço cair, nada quebra: o painel volta ao botão Atualizar e os
leads continuam entrando.

### Painel — Next dinâmico

Lista, filtros, exportação, gestão de equipe, trilha de auditoria.
Autenticação pelo Better Auth. Admin vê tudo; coordenador vê só as
regiões atribuídas a ele — e o filtro é aplicado **na consulta**, não na
tela.

---

## Decisões que valem explicar

### Por que não há gerência de estado global

Nenhum Context, nenhum Zustand. O que é compartilhado é dado de servidor,
e Server Component já resolve. O único estado real é o do formulário, e
ele mora dentro do formulário. Provider antes da necessidade cria o
problema para depois ter a solução.

### Por que o lead cai em arquivo quando não há banco

`var/leads.jsonl`. Em desenvolvimento sem `DATABASE_URL`, o lead é
gravado em arquivo em vez de dar erro. Lead perdido é matrícula perdida,
e a família não volta para tentar de novo.

### Por que o envio ao CRM não bloqueia a resposta

A família recebe a confirmação na hora. O envio ao Sevenbee acontece
depois; se falhar, vira estado no banco com contador de tentativas e é
reprocessado pela tarefa agendada. Integração de terceiro fora do ar não
pode custar um lead.

### Por que o painel não marca quem está atendendo

O atendimento acontece no Sevenbee, e o `atendimento_status` chega pelo
webhook deles. O painel marcar dono criaria uma segunda verdade que
divergiria da primeira no primeiro dia de uso. Chegou a existir e foi
removido. O que o tempo real mostra é presença — quem está olhando o quê
agora —, que é estado do instante e não compete com nada.

### Por que o consentimento é versionado

O art. 8º §2º da LGPD põe o ônus da prova no controlador, e o §4º anula
autorização genérica. Guardar "aceitou: sim" não prova nada, porque não
diz **a quê** a pessoa disse sim — e o texto do formulário muda com o
tempo. Por isso o texto vive versionado em `src/lib/consentimento.ts`, e
o registro guarda versão, resumo criptográfico, IP e navegador.

**Nunca edite o texto de uma versão publicada.** Crie uma nova. Editar em
cima destrói a prova de quem aceitou a anterior.

### Por que a política de privacidade é nossa

A política nacional descreve o portal da rede, não este formulário.
Mandar a família para lá seria apontar para um texto que não fala da
coleta que ela acabou de fazer.

### Por que não há aviso de cookies

Decisão do cliente, 04/09/2026: a campanha precisa da medição cheia, e a
analítica se apoia em legítimo interesse. Em troca, a política declara
isso abertamente e oferece o caminho de quem não quiser ser medido.
Reversível — o banner entra por cima, sem mexer no resto.

---

## Dados

| Tabela | Guarda | Observação |
|---|---|---|
| `leads` | contato, região, escola, nível, UTM, status | o gatilho de aviso vive aqui |
| `consentimentos` | versão, hash, IP, agente, método | tabela própria: sobrevive ao descarte do lead |
| `acessos` | quem entrou, de onde, o que fez | inclui tentativa de entrada negada |
| `regioes_config` | WhatsApp por região | editável no painel, sem deploy |
| `user`, `session`, `account` | Better Auth | `regioes` diz o que o coordenador vê |

`db/schema.sql` é fonte única e é idempotente. `db/migrar.mjs` roda em
ensaio por padrão. **Coluna nova exige entrada em `EXIGE_COLUNA`** — a
checagem antiga era uma lista fixa que envelheceu e passou a dizer "nada
pendente" para banco atrasado.

---

## Integrações

| Sentido | Com quem | Onde |
|---|---|---|
| entra | Educação dos Sonhos (outro domínio) | `POST /api/leads` |
| entra | Sevenbee, status de atendimento | `/api/sevenbee/webhook`, segredo em tempo constante |
| sai | Sevenbee, contato novo | `POST /core/v1/contact`, upsert por telefone |
| sai | Dica Plus | a construir, esperando a API deles |

---

## Quando separar de verdade

Backend em processo próprio se paga quando aparece **um** destes. Hoje só
o primeiro apareceu, e por isso só o tempo real saiu:

- conexão que fica aberta (WebSocket, SSE, notificação ao vivo)
- processo longo que não cabe no tempo de uma requisição
- necessidade de escalar a API separada do site
- deploy em ritmo diferente do front
- API pública para terceiros, com chave, versão, limite e documentação

Ter API e webhook **não** é critério: isso é Route Handler.

---

## Rodando

```bash
docker compose up -d db email     # Postgres em 5433, Mailpit em 8025
node db/migrar.mjs                # ensaio
node db/migrar.mjs --aplicar
npm run dev

cd tempo-real && npm install && npm start
```

Produção: container do Next (standalone) mais o container do tempo real,
os dois no Coolify, contra o mesmo Postgres.

---

## Dívida conhecida

Está aqui porque dívida não escrita vira surpresa:

- `/api/leads` é rota pública **sem limite de requisição**
- **sem idempotência**: webhook reenviado ou clique duplo geram repetição
- credencial única, em vez de uma por origem
- erro só em `console.error` — nada avisa ninguém às 23h
- nenhum teste exercita rota de ponta a ponta; os testes são de lógica pura
- fila de reenvio é do Sevenbee; com o Dica Plus, o estado precisa ser por destino
- falta marcar a origem do lead (`projeto`, `origem_pagina`): hoje
  Educação dos Sonhos e matrículas chegam misturados
