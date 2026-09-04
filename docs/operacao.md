# Operação

O que fazer quando algo precisa ser feito ou algo quebra. Escrito para
quem chega no meio, inclusive eu daqui a três meses.

---

## Ambiente local

```bash
docker compose up -d db email     # Postgres 5433 · Mailpit 8025
cp .env.example .env              # preencher DATABASE_URL e BETTER_AUTH_SECRET
node db/migrar.mjs                # ensaio: mostra o que falta, não executa
node db/migrar.mjs --aplicar      # executa em transação, com rollback
npm run dev
```

E-mail em desenvolvimento não sai para a internet: cai no Mailpit, em
<http://localhost:8025>.

Serviço de tempo real, em outro terminal:

```bash
cd tempo-real && npm install
DATABASE_URL=... ORIGEM=http://localhost:3000 npm start
```

Ele é opcional. Sem ele o painel funciona, só não se atualiza sozinho.

---

## Primeiro acesso ao painel

Não há usuário semente. Com o banco vazio de administradores, `/painel`
oferece o cadastro do primeiro. Daí em diante, contas são criadas dentro
do painel, em **Equipe** — o cadastro público fica bloqueado no handler.

---

## Mudar o banco

1. Editar `db/schema.sql` — sempre com `IF NOT EXISTS`, o arquivo tem de
   poder rodar de novo em banco que já existe
2. Se criou coluna, **adicionar em `EXIGE_COLUNA`** dentro de
   `db/migrar.mjs`, senão o ensaio mente
3. `node db/migrar.mjs` e conferir a lista de pendências
4. `node db/migrar.mjs --aplicar`

O runner mostra a contagem de leads antes e depois. Se mudou, algo saiu
errado.

---

## Antes de subir qualquer coisa

```bash
npm run ci      # tipos, testes, build e sintaxe do tempo real
```

Depois do CI verde, **revisão com o Codex** sobre o diff, pedindo leitura
adversarial. Só então `git push` e PR. Um passo que falha invalida os
seguintes: CI vermelho não vai para revisão, e revisão com apontamento
aberto não vira PR.

---

## Publicar

Container do Next (standalone) e container do tempo real, os dois no
Coolify, contra o mesmo Postgres. O `docker-compose.yml` tem os dois.

Tarefa agendada a cadastrar no Coolify, a cada 10 minutos:

```
curl -fsS "https://<dominio>/api/tarefas/reenviar-falhas?segredo=$CRON_SEGREDO"
```

É ela que reprocessa lead que falhou ao ir para o Sevenbee.

---

## Quando dá problema

**Leads param de chegar no Sevenbee.** Olhe o filtro "Com falha" no
painel. `webhook_status` guarda o motivo (`falhou:401`, `falhou:erro-de-rede`).
401 é token; erro de rede costuma resolver sozinho na próxima rodada da
tarefa. O botão "Reenviar todos" força agora.

**O painel não se atualiza sozinho.** O serviço de tempo real caiu.
Confira `curl http://<host>:3801/saude`. Nada se perde: os leads
continuam entrando, e a tela volta a depender do botão Atualizar.

**Ninguém consegue entrar.** Veja `acessos` filtrando `login_falhou`. Se
não houver nem tentativa registrada, o problema é antes: `BETTER_AUTH_URL`
diferente do domínio real derruba o cookie de sessão.

**Uma família reclama de dois contatos.** Confira `atendente_id` e
`atendente_nome` no lead. Se estiverem vazios com o atendimento já em
curso, o lead foi trabalhado direto no Sevenbee, sem passar pelo painel —
o dono só é gravado por quem clica em atender aqui.

**Alguém questiona um consentimento.** A prova está em `consentimentos`,
por `lead_id`: versão, data, IP e o resumo criptográfico. `intacto`
recalcula o hash — falso significa que o texto daquela versão foi editado
depois do aceite, o que nunca deve acontecer.

---

## Segredos

Todos em variável de ambiente, nenhum no código. `.env.example` lista
todos com o que cada um faz. Os que doem se faltarem:

| Variável | Sem ela |
|---|---|
| `DATABASE_URL` | lead cai em `var/leads.jsonl`, painel não autentica |
| `BETTER_AUTH_SECRET` | sessão não assina; o painel não funciona |
| `SEVENBEE_TOKEN` | lead fica pendente, aparece aviso no painel |
| `SEVENBEE_WEBHOOK_SEGREDO` | status de atendimento não volta |
| `CRON_SEGREDO` | fila de reenvio não roda |
| `SMTP_*` | some a confirmação para a família e o "esqueci a senha" |
