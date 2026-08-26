# Educação Adventista Centro-Oeste · Landing de Matrículas 2027

Landing page de captação de leads da campanha **"Educando Gerações com Valores
pra Vida"** (130 anos, #MuitoAlémdoEnsino), cobrindo as 39 escolas da rede no
Centro-Oeste mais o internato IABC.

- **Produção:** https://educaadventistacentrooeste.com.br (aguardando deploy)
- **Repositório:** git@github.com:davialvescine/educacao-landing-page-matriculas.git
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
  shadcn/ui (Base UI) · Postgres · Better Auth · Docker

> Estado em 26/08/2026: sistema completo e testado no espelho Docker.
> Falta apenas o deploy e as chaves de terceiros (ver seção 11).

---

## 1. Como rodar

### Espelho da produção (recomendado)

Sobe o mesmo container que roda no Coolify, com Postgres e servidor de
e-mail de testes:

```bash
docker compose up -d --build   # site em http://localhost:3300
docker compose down            # parar (-v também apaga o banco)
```

| Serviço | Onde | Para quê |
|---|---|---|
| Site + painel | http://localhost:3300 | a aplicação |
| Caixa de e-mail | http://localhost:8025 | ver os e-mails que o sistema envia (Mailpit, nada sai para a internet) |
| Postgres | localhost:5433 | `psql` e o CLI do Better Auth |

**Contas de teste locais** (existem só no seu Docker):

- Administrador: `davi@ucob.org.br` / `senhanovaviaemail1`
- Coordenadora de Goiás: `goias@ucob.org.br` / `novasenha456`

### Desenvolvimento sem Docker

```bash
npm install
npm run dev            # http://localhost:3000
```

Sem `DATABASE_URL`, os leads caem em `var/leads.jsonl` e o painel não
funciona (a autenticação exige banco).

---

## 2. Páginas

| Rota | O que é |
|---|---|
| `/` | Home: hero, rede mundial, mapa 3D, níveis, diferenciais, um dia na escola, mundo, depoimentos, IABC, FAQ e formulário |
| `/[estado]` | Página por região (6) |
| `/[estado]/[escola]` | Página por unidade (39), com formulário pré-selecionado |
| `/obrigado` | Confirmação pós-lead com o WhatsApp da região (noindex) |
| `/painel` | Leads. Exige login (noindex) |
| `/painel/equipe` | Gestão de usuários e registro de atividades. Só administradores |
| `/painel/nova-senha` | Destino do link de redefinição enviado por e-mail |
| `/sitemap.xml`, `/robots.txt` | SEO (46 URLs indexáveis) |

## 3. APIs

| Rota | Função | Quem pode |
|---|---|---|
| `POST /api/leads` | Recebe o lead, salva e dispara ao Sevenbee | público |
| `POST /api/sevenbee/webhook` | Status de atendimento vindo do Sevenbee | segredo na URL |
| `/api/auth/[...all]` | Login, logout, sessão, redefinição de senha (Better Auth) | público (cadastro bloqueado) |
| `POST /api/painel/primeiro-acesso` | Cria o primeiro administrador | só enquanto não há admin |
| `GET/POST/PATCH /api/painel/usuarios` | Lista, cria e edita a equipe | admin |
| `POST /api/painel/reenviar` | Reenvia um lead ao CRM | logado (só da própria região) |
| `POST /api/painel/reenviar-todos` | Reprocessa pendentes e falhas | admin |
| `GET /api/painel/exportar` | CSV dos leads | logado (só da própria região) |
| `GET /api/tarefas/reenviar-falhas` | Tarefa agendada de reenvio | segredo na URL |

---

## 4. Fluxo do lead (ponta a ponta)

```
Formulário (2 etapas)
  ↓ POST /api/leads  (valida região, nome e WhatsApp com DDD)
Postgres  (o lead nunca se perde, mesmo se a integração falhar)
  ↓ push imediato, na mesma requisição
Sevenbee  POST /core/v1/contact  (upsert por telefone, não duplica contato)
  ↓ status gravado em webhook_status
Painel /painel   →  Recebido · Enviado · Falha no envio (com botão Reenviar)
  ↑ webhook de retorno (SESSION_CREATED / UPDATED / ENDED)
Atendimento      →  Aguardando · Em atendimento · Atendido
```

**Coletado de cada família:** nome, WhatsApp, e-mail (opcional), região,
escola de interesse, série/nível, aceite LGPD e origem de campanha
(utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid).

**Enviado ao Sevenbee:** contato com nome, telefone e e-mail; etiquetas
`Matrículas 2027` + região; anotação com região, escola, nível e campanha;
metadados com `lead_id`, região, associação e as UTMs.

---

## 5. Autenticação e permissões

Migrado do sistema caseiro para **Better Auth 1.7** em 26/08/2026.

- **Login por e-mail e senha.** Cadastro público bloqueado no handler
  (`src/app/api/auth/[...all]/route.ts`): contas só nascem pelo primeiro
  acesso ou pela mão de um administrador.
- **Primeiro acesso:** com o banco vazio, `/painel` oferece criar a conta de
  administrador. Depois disso a tela some.
- **Papéis:** `admin` (vê tudo e gerencia a equipe) e `coordenador` — que no
  banco é `user`, nome do plugin admin do Better Auth. O coordenador enxerga
  apenas os leads das regiões atribuídas, **inclusive na exportação CSV e no
  reenvio**.
- **Desativar acesso** usa o banimento do plugin: corta na hora, sem esperar
  a sessão expirar. Um administrador não consegue remover o próprio acesso.
- **Esqueci minha senha:** link por e-mail, válido 1 hora e de uso único.
  Sem SMTP configurado, o link some e o administrador cadastra a senha
  manualmente.
- **Registro de acessos** (tabela `acessos`) para LGPD: login, exportação,
  reenvio e gestão de usuários. Identificadores internos são substituídos na
  leitura, então não trafegam até o navegador.

### Armadilhas encontradas (não repetir)

1. `disableSignUp: true` bloqueia o cadastro **até em chamadas do servidor**,
   ao contrário da documentação. Por isso o cadastro fica habilitado no núcleo
   e a rota pública é bloqueada no handler.
2. O `@better-auth/cli generate` **não emite a coluna `issuer`** da tabela
   `account`, mas o runtime 1.7 exige. Ela está no `db/schema.sql` com
   comentário.
3. O `Select` do Base UI não atualiza o rótulo exibido quando o valor muda por
   código. Resolvido com `key` no componente (ver `LeadForm.tsx`).

---

## 6. Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Postgres |
| `BETTER_AUTH_SECRET` | sim | Chave das sessões. Gere com `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | sim | URL pública (callbacks e cookies) |
| `SEVENBEE_TOKEN` | recomendada | API do Sevenbee (Configurações > Integrações > Integração API) |
| `SEVENBEE_TAG` | não | Etiqueta base (padrão `Matrículas 2027`) |
| `SEVENBEE_WEBHOOK_SEGREDO` | recomendada | Segredo do webhook de retorno |
| `CRON_SEGREDO` | recomendada | Segredo da tarefa de reenvio |
| `SMTP_HOST`, `SMTP_PORTA`, `SMTP_USUARIO`, `SMTP_SENHA`, `SMTP_REMETENTE` | recomendada | "Esqueci minha senha". Com Google Workspace: `smtp.gmail.com`, porta 587, e **senha de app** (a senha normal não funciona) |
| `NEXT_PUBLIC_SITE_URL` | não | URL canônica (padrão: domínio oficial) |
| `NEXT_PUBLIC_GA_ID` | não | GA4 (padrão embutido `G-8ZSKJGD105`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | quando houver ads | Meta Pixel |
| `LEAD_WEBHOOK_URL` / `_TOKEN` | não | Webhook genérico (fallback sem Sevenbee) |

Modelo completo em `.env.example`; passo a passo em `DEPLOY.md`.

---

## 7. Organização do código

```
src/
  app/
    [estado]/[escola]/     páginas de região e unidade
    api/                   rotas (ver seção 3)
    painel/                painel, equipe e nova senha
  components/
    painel/                LoginPainel, PainelLeads, GestaoEquipe, NovaSenha
    (raiz)                 Hero, MapaRegioes, LeadForm, WhatsFlutuante, FaqSection...
  lib/
    auth.ts                instância do Better Auth
    auth-client.ts         cliente (login, logout, redefinição)
    painel-auth.ts         sessão + papéis + regiões permitidas
    usuarios.ts            registro de acessos (LGPD)
    leads.ts               salvar, listar e filtrar leads
    sevenbee.ts            envio ao CRM
    webhook.ts             escolhe Sevenbee ou webhook genérico
    reprocesso.ts          reenvio em lote
    email.ts               SMTP e o e-mail de redefinição
    rede.ts / site.ts      dados da rede e config de SEO
db/schema.sql              tabelas (leads, acessos, Better Auth)
```

`src/data/rede.json` é a fonte única dos dados da rede.

---

## 8. Dados da rede

| Região | Associação | Unidades | WhatsApp |
|---|---|---|---|
| Distrito Federal (DF) | APLAC | 9 | (61) 98329-0006 |
| Goiás (GO) | ABC | 9 | (62) 99409-4449 |
| Mato Grosso do Sul (MS) | ASM | 8 | (67) 9985-0619 ⚠️ confirmar |
| Oeste Mato-Grossense (MT) | AOM | 5 | (65) 9942-1370 ⚠️ confirmar |
| Tocantins (TO) | MTO | 4 | (63) 99202-1837 |
| Leste Mato-Grossense (MT) | ALM | 4 | ⚠️ pendente |
| IABC (Internato) | UCOB | 1 | (62) 3395-8000 |

---

## 9. Identidade visual

Tokens em `src/app/globals.css` (`@theme`), extraídos dos PSDs da campanha:

- **Azul:** `brand-700 #12269e` · `brand-950 #050c42`
- **Dourado:** `gold-300 #f8e068` · `gold-400 #f8c038` · `gold-500 #f8a010`
- **Tipografia:** Plus Jakarta Sans (400 a 800) · **Raio:** 1rem

**Ritmo de fundos da home** (alterna para nenhum bloco parecer gêmeo do
vizinho): hero dourado → tarja ouro → rede mundial clara → mapa navy →
níveis creme → diferenciais azul-claro → um dia branco → mundo navy →
depoimentos quentes → IABC navy → FAQ azul-claro → formulário claro.

**Animações** (todas respeitam `prefers-reduced-motion`): reveal on scroll,
esteiras de depoimentos e do IABC, constelação de partículas em canvas,
flutuar do globo, zoom lento de fundos, shimmer nas letras, mapa 3D.

---

## 10. SEO e GEO

- 46 páginas indexáveis (home + 6 regiões + 39 unidades)
- Dados estruturados: `EducationalOrganization`, `School` + `BreadcrumbList`,
  `ItemList`, `FAQPage`
- Metadados por cidade, canonical, Open Graph, `max-image-preview:large`
- Medição: GA4 (`generate_lead`, `whatsapp_click`) e Meta Pixel (`Lead`,
  `Contact`)

**Posicionamento:** os concorrentes fortes de cada praça (Sigma, Olimpo,
Galois e Marista no DF; WR e Agostiniano em GO; Classe A e Salesiano em MS;
Ibero Americano em MT; Olimpo Integral e COC em TO) vendem nota no ENEM ou
tradição católica. O espaço livre, e a nossa aposta, é **ensino forte +
valores cristãos + acesso**.

---

## 11. O que falta

### Bloqueia o lançamento

- [ ] **Token do Sevenbee** (`pn_...`). Sem ele o lead fica em "Recebido" e
      não chega ao CRM. É a única parte escrita e nunca testada contra o
      serviço real
- [ ] **VPS** contratada + Coolify instalado
- [ ] **Nameservers** do domínio → Cloudflare
      (`arely.ns.cloudflare.com`, `kobe.ns.cloudflare.com`, confirmar ao
      adicionar o domínio na conta)

### Depois do site no ar

- [ ] Assinar o webhook no Sevenbee (Ajustes > Integrações > Webhooks) com
      `SESSION_CREATED`, `SESSION_UPDATED`, `SESSION_ENDED`
- [ ] Caixa de e-mail + senha de app do Google para a recuperação de senha
- [ ] Google Search Console e envio do sitemap
- [ ] Revisar os Perfis de Empresa no Google das 39 unidades
- [ ] ID do Meta Pixel, se houver campanha paga

### Dados incompletos (não bloqueiam)

- [ ] WhatsApp do Leste Mato-Grossense (hoje o chat manda ao formulário)
- [ ] Confirmar MS e Oeste MT (parecem faltar um dígito)
- [ ] Fotos próprias de 5 unidades: Valparaíso, Porangatu, Goianiense, Sinop
      e Várzea Grande (hoje usam a fachada de outra unidade)
- [ ] Autorização da foto de Rondonópolis (extraída do Google Maps)
- [ ] Depoimentos de MS e dos dois Mato Grosso (só temos GO, DF e TO)
- [ ] Dados acadêmicos (aprovações, ENEM, olimpíadas) para prova de ensino

### Posso executar sozinho quando quiser

- [ ] Guia de conteúdo (6 a 8 artigos) para busca informacional e GEO
- [ ] Seção de investimento (captura a busca "quanto custa")
- [ ] Arte dedicada de compartilhamento (og:image 1200×630)
- [ ] Auditoria de performance (Lighthouse)
- [ ] Vídeo de intro via Magnific

---

## 12. Histórico

1. **Extração de dados** do site antigo (ucob.efcx.pro) e reconciliação com a
   lista oficial: 39 escolas, endereços, fotos e WhatsApps
2. **Identidade visual** a partir dos PSDs da campanha
3. **Home e páginas de região** com hero, mapa 3D, níveis, diferenciais e
   depoimentos reais
4. **Funil de leads**: formulário em 2 etapas, API, banco, obrigado e chat
   flutuante de WhatsApp por região
5. **Painel de leads** com resumo, filtros, modal, CSV e reenvio
6. **Integração Sevenbee** (push na hora) e webhook de retorno com status de
   atendimento
7. **SEO/GEO**: páginas por escola, FAQ, schemas, sitemap, robots e GA4
8. **Campanha**: captura de UTM, eventos de conversão, Meta Pixel, 404,
   favicon e reenvio automático
9. **Polimento visual** guiado por referências (land-book, Refero) e revisão
   tela a tela
10. **IABC**: foto aérea do campus, carrossel da vida no internato e captação
    de lead própria
11. **Autenticação de usuários** com Better Auth: papéis, regiões por pessoa,
    gestão de equipe, recuperação de senha por e-mail e registro de acessos

---

## 13. Comandos úteis

```bash
docker compose up -d --build            # espelho da produção
docker compose logs web -f              # ver o que o servidor está fazendo
npm run build                           # build de produção
npm run lint                            # lint
psql "$DATABASE_URL" -f db/schema.sql   # criar/atualizar as tabelas

# banco local do Docker
docker compose exec db psql -U matriculas -d matriculas
```
