# Serviço de tempo real

Processo separado, de propósito, e com uma responsabilidade só: manter as
telas do painel em dia umas com as outras.

## Por que não dentro do Next

O painel roda em `output: "standalone"`, que gera um `server.js` mínimo
para o container. O guia do Next diz, com todas as letras, que esse modo
não rastreia arquivos de servidor customizado — os dois não convivem. E
Route Handler não segura WebSocket: ele responde e encerra.

Trocar o standalone por um `server.ts` com Socket.IO embutido resolveria,
mas mexeria no deploy que já funciona e engordaria a imagem. Este serviço
custa cento e poucas linhas e não encosta no Next.

## Como as duas metades se falam

```
navegador  ⇄ Socket.IO ⇄  este serviço
                              ↑ LISTEN leads_mudou
Next /api/*  ──trigger──►  Postgres
```

Ninguém chama ninguém por HTTP. O gatilho `leads_avisar_trg` (em
`db/schema.sql`) dispara em qualquer escrita na tabela — formulário,
webhook do Sevenbee, fila de reenvio, UPDATE feito na mão — e este
serviço escuta o canal. Foi de propósito: a aplicação tem quatro caminhos
de escrita e esqueceria um.

Consequência boa: se este processo cair, nada quebra. O painel volta a
depender do botão Atualizar e da recarga periódica, e os leads continuam
entrando.

## Sessão

O serviço não tem login próprio. Ele lê o cookie do Better Auth, procura
o token na tabela `session` e junta com `user` para saber papel e
regiões. Segredo nenhum é compartilhado entre os dois processos: a
verdade está no banco, que os dois já acessam.

## Variáveis

    DATABASE_URL   o mesmo banco do painel
    PORTA          padrão 3801
    ORIGEM         URL do painel, para o CORS do Socket.IO
