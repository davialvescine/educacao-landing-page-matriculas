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
   | `PAINEL_SENHA` | sim (produção) | Senha do painel de leads em `/painel` (sessão de 12h via cookie assinado). |
   | `LEAD_WEBHOOK_URL` | não | Fallback: webhook genérico usado apenas se `SEVENBEE_TOKEN` não estiver definido. |
   | `LEAD_WEBHOOK_TOKEN` | não | Se definido, vai como `Authorization: Bearer <token>` no webhook genérico. |
   | `SEVENBEE_WEBHOOK_SEGREDO` | recomendada | Segredo do webhook de retorno do Sevenbee (status de atendimento). Cadastre no Sevenbee (Ajustes > Integrações > Webhooks) a URL `https://<dominio>/api/sevenbee/webhook?segredo=<valor>` assinando os eventos `SESSION_CREATED`, `SESSION_UPDATED` e `SESSION_ENDED`. |

   O fluxo do lead é **push**: ao enviar o formulário, o lead é salvo no
   Postgres e, na sequência, enviado ao Sevenbee na mesma requisição. O
   resultado fica em `webhook_status` (`enviado` / `falhou:*`), visível no
   painel `/painel`, que também permite reenviar manualmente os que falharem.

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
