# Deploy — Landing de Matrículas (Coolify + Cloudflare)

Stack: Next.js 16 (App Router, páginas estáticas + `/api/leads` dinâmica), Postgres, Docker.

## 1. Coolify

1. Suba o repositório para um Git (GitHub/GitLab/Gitea).
2. No Coolify: **New Resource → Application → seu repositório**.
   - Build Pack: **Dockerfile** (já está na raiz).
   - Porta: **3000**.
3. Crie também um **PostgreSQL** no Coolify e rode o schema uma vez:
   ```sh
   psql "$DATABASE_URL" -f db/schema.sql
   ```
4. Variáveis de ambiente da aplicação:

   | Variável | Obrigatória | Descrição |
   |---|---|---|
   | `DATABASE_URL` | sim (produção) | URL do Postgres do Coolify. Sem ela, leads caem em `var/leads.jsonl` (somente dev). |
   | `SEVENBEE_TOKEN` | recomendada | Token da API do Sevenbee (Configurações > Integrações > Integração API). Com ele, cada lead vira um contato via `POST /core/v1/contact` com upsert por telefone. |
   | `SEVENBEE_TAG` | não | Etiqueta base aplicada aos contatos (padrão: `Matrículas 2027`). A região entra como segunda etiqueta. |
   | `BETTER_AUTH_SECRET` | sim (produção) | Chave de assinatura das sessões do painel. Gere com `openssl rand -base64 32`. |
   | `BETTER_AUTH_URL` | sim (produção) | URL pública do site (callbacks e cookies), ex.: `https://educaadventistacentrooeste.com.br`. |
   | `LEAD_WEBHOOK_URL` | não | Fallback: webhook genérico usado apenas se `SEVENBEE_TOKEN` não estiver definido. |
   | `LEAD_WEBHOOK_TOKEN` | não | Se definido, vai como `Authorization: Bearer <token>` no webhook genérico. |
   | `CRON_SEGREDO` | recomendada | Segredo da tarefa de reenvio automático. Agende no Coolify (Scheduled Tasks) um `curl -fsS "https://<dominio>/api/tarefas/reenviar-falhas?segredo=<valor>"` a cada 10 minutos. |
   | `NEXT_PUBLIC_GA_ID` | não | ID do GA4 (padrão embutido: `G-8ZSKJGD105`). |
   | `NEXT_PUBLIC_META_PIXEL_ID` | quando houver ads | Meta Pixel para campanhas de Facebook/Instagram; dispara `PageView`, `Lead` e `Contact`. |
   | `NEXT_PUBLIC_SITE_URL` | não | URL canônica (padrão embutido: `https://educaadventistacentrooeste.com.br`). |
   | `SMTP_HOST`, `SMTP_PORTA`, `SMTP_USUARIO`, `SMTP_SENHA`, `SMTP_REMETENTE` | recomendada | Envio do "esqueci minha senha" do painel. Com Google Workspace: `smtp.gmail.com`, porta 587, usuário = e-mail da conta e senha = **senha de app** gerada na conta Google. Sem isso, o link some e o administrador cadastra a senha manualmente. |
   | `SEVENBEE_WEBHOOK_SEGREDO` | recomendada | Segredo do webhook de retorno do Sevenbee (status de atendimento). Cadastre no Sevenbee (Ajustes > Integrações > Webhooks) a URL `https://<dominio>/api/sevenbee/webhook?segredo=<valor>` assinando os eventos `SESSION_CREATED`, `SESSION_UPDATED` e `SESSION_ENDED`. |

   **Primeiro acesso ao painel:** com o banco vazio, abra
   `https://<dominio>/painel` e crie a conta de administrador (nome, e-mail e
   senha). A partir daí, os demais usuários são cadastrados dentro do painel,
   em **Equipe**, com papel (administrador ou coordenador) e as regiões que
   cada um pode ver. A tela de primeiro acesso desaparece depois disso.

   O fluxo do lead é **push**: ao enviar o formulário, o lead é salvo no
   Postgres e, na sequência, enviado ao Sevenbee na mesma requisição. O
   resultado fica em `webhook_status` (`enviado` / `falhou:*`), visível no
   painel `/painel`, que também permite reenviar manualmente os que falharem.

## Teste local com Docker (espelho da produção)

Roda o mesmo container do Coolify + Postgres com a tabela criada
automaticamente:

```bash
docker compose up -d --build   # site em http://localhost:3300
docker compose down            # parar (com -v apaga o banco)
```

Painel em `http://localhost:3300/painel` (senha local: `matriculas2027`).
Para testar o envio real ao Sevenbee, descomente `SEVENBEE_TOKEN` no
`docker-compose.yml` e cole o token.

## 2. Cloudflare (na frente da VPS)

1. Nameservers do domínio → Cloudflare; registro `A` → IP da VPS com **proxy ligado** (nuvem laranja).
2. SSL/TLS: **Full (strict)** + certificado de origem instalado no proxy do Coolify.
3. Cache Rules:
   - **Cache everything** para o site (HTML + `/imagens/*` + `/_next/static/*`).
   - **Bypass cache** para `/api/*` (e o futuro painel).
4. Firewall da VPS: aceitar 80/443 apenas dos IPs da Cloudflare.

## 3. Contrato do webhook (combinar com o time do sistema deles)

`POST` JSON no endpoint que eles fornecerem:

```json
{
  "id": "uuid",
  "nome": "…",
  "whatsapp": "…",
  "email": "…",
  "estado": "goias",
  "estado_nome": "Goiás",
  "associacao": "ABC",
  "escola": "Escola Adventista Vila Nova",
  "nivel": "Ensino Médio",
  "origem": "landing-matriculas"
}
```

Resposta esperada: qualquer 2xx. Timeout de 8 s; falhas ficam com
`webhook_status = 'falhou:*'` no banco para reenvio posterior.

## Pendências de dados (ver `referencia/rede.json`)

- WhatsApp regional da **ALM (Leste MT)** — sem ele a página não mostra botão de WhatsApp (formulário continua funcionando).
- Confirmar dígito dos WhatsApps de **MS** (67 9985-0619) e **Oeste MT** (65 9942-1370).
- Fotos próprias: Rondonópolis + as 5 que reutilizam foto (Valparaíso, Porangatu, Goianiense, Sinop, Várzea Grande).

## Próximos passos planejados

- Painel de leads (rota protegida lendo a tabela `leads`).
- Job de reenvio de webhooks com `webhook_status <> 'enviado'`.
