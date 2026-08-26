# Educação Adventista Centro-Oeste · Landing de Matrículas 2027

Landing page de captação de leads da campanha **"Educando Gerações com Valores
pra Vida"** (130 anos, #MuitoAlémdoEnsino), cobrindo as 39 escolas da rede no
Centro-Oeste mais o internato IABC.

- **Produção:** https://educaadventistacentrooeste.com.br (aguardando deploy)
- **Repositório:** git@github.com:davialvescine/educacao-landing-page-matriculas.git
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
  shadcn/ui (Base UI) · Postgres · Docker

---

## 1. Como rodar

### Desenvolvimento

```bash
npm install
npm run dev            # http://localhost:3000
```

Sem `DATABASE_URL`, os leads caem em `var/leads.jsonl` (arquivo local).

### Espelho da produção (Docker)

Sobe o mesmo container que roda no Coolify, com Postgres e a tabela criada
automaticamente:

```bash
docker compose up -d --build   # http://localhost:3300
docker compose down            # parar (-v também apaga o banco)
```

Painel de leads: `http://localhost:3300/painel` (senha local `matriculas2027`).

---

## 2. Estrutura de páginas

| Rota | O que é |
|---|---|
| `/` | Home da campanha: hero, rede mundial, mapa, níveis, diferenciais, um dia na escola, mundo, depoimentos, IABC, FAQ e formulário |
| `/[estado]` | Página por região (6): hero compacto, unidades, diferenciais, depoimentos e formulário |
| `/[estado]/[escola]` | Página por unidade (39): capa, texto local, diferenciais, depoimentos e formulário pré-selecionado |
| `/obrigado` | Confirmação pós-lead com o WhatsApp da região (noindex) |
| `/painel` | Painel interno de leads, protegido por senha (noindex) |
| `/sitemap.xml`, `/robots.txt` | SEO (46 URLs indexáveis) |

### API

| Rota | Função |
|---|---|
| `POST /api/leads` | Recebe o lead, salva e dispara ao Sevenbee |
| `POST /api/sevenbee/webhook` | Recebe status de atendimento do Sevenbee (protegido por segredo na URL) |
| `POST /api/painel/sessao` · `DELETE` | Login e logout do painel |
| `POST /api/painel/reenviar` | Reenvia um lead ao sistema externo |
| `POST /api/painel/reenviar-todos` | Reprocessa pendentes e falhas |
| `GET /api/painel/exportar` | Exporta os leads em CSV |
| `GET /api/tarefas/reenviar-falhas` | Tarefa agendada de reenvio (protegida por segredo) |

---

## 3. Fluxo do lead (ponta a ponta)

```
Formulário (2 etapas)
  ↓ POST /api/leads  (valida região, nome e WhatsApp com DDD)
Postgres  (o lead nunca se perde, mesmo se a integração falhar)
  ↓ push imediato, na mesma requisição
Sevenbee  POST /core/v1/contact  (upsert por telefone, não duplica contato)
  ↓ status gravado em webhook_status
Painel /painel   →  Recebido · Enviado · Falha no envio (com botão Reenviar)
  ↑ webhook de retorno do Sevenbee (SESSION_CREATED / UPDATED / ENDED)
Atendimento      →  Aguardando · Em atendimento · Atendido
```

**O que é coletado:** nome, WhatsApp, e-mail (opcional), região, escola de
interesse, série/nível, aceite LGPD e a origem de campanha (utm_source,
utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid).

**O que vai para o Sevenbee:** contato com nome, telefone e e-mail; etiquetas
`Matrículas 2027` + região; anotação com região, escola, nível e campanha;
metadados com `lead_id`, região, associação e as UTMs.

---

## 4. Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim (produção) | Postgres. Sem ela, usa `var/leads.jsonl` (dev) |
| `PAINEL_SENHA` | sim (produção) | Senha do `/painel` (sessão de 12h, cookie assinado) |
| `SEVENBEE_TOKEN` | recomendada | Token da API (Configurações > Integrações > Integração API) |
| `SEVENBEE_TAG` | não | Etiqueta base (padrão `Matrículas 2027`) |
| `SEVENBEE_WEBHOOK_SEGREDO` | recomendada | Segredo do webhook de retorno |
| `CRON_SEGREDO` | recomendada | Segredo da tarefa de reenvio automático |
| `NEXT_PUBLIC_SITE_URL` | não | URL canônica (padrão: domínio oficial) |
| `NEXT_PUBLIC_GA_ID` | não | GA4 (padrão embutido `G-8ZSKJGD105`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | quando houver ads | Meta Pixel |
| `LEAD_WEBHOOK_URL` / `_TOKEN` | não | Webhook genérico (fallback sem Sevenbee) |

Modelo completo em `.env.example`; passo a passo de deploy em `DEPLOY.md`.

---

## 5. Dados da rede

`src/data/rede.json` é a fonte única: 6 regiões, 39 escolas (nome oficial,
endereço, foto), WhatsApp por região, estatísticas, diferenciais e IABC.
Acesso tipado em `src/lib/rede.ts` (`getEstados`, `getEscola`, `slugEscola`,
`getRegiaoLead`, `getFormEstados`).

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

## 6. Identidade visual

Tokens em `src/app/globals.css` (`@theme`), extraídos das artes oficiais da
campanha (PSDs da pasta de comunicação):

- **Azul da marca:** `brand-700 #12269e` · `brand-950 #050c42`
- **Dourado:** `gold-300 #f8e068` · `gold-400 #f8c038` · `gold-500 #f8a010`
- **Tipografia:** Plus Jakarta Sans (400 a 800)
- **Raio:** 1rem · **Sombras:** `--shadow-card`, `-hover`, `-cta`, `-foto`

**Ritmo de fundos da home** (alterna para nenhum bloco parecer gêmeo do
vizinho): hero dourado → tarja ouro → rede mundial clara → mapa navy →
níveis creme → diferenciais azul-claro → um dia branco → mundo navy →
depoimentos quentes → IABC navy → FAQ azul-claro → formulário claro.

**Animações** (todas com `prefers-reduced-motion`): reveal on scroll,
esteiras de depoimentos e do IABC, constelação de partículas (canvas),
flutuar do globo, zoom lento de fundos, shimmer nas letras, mapa 3D.

---

## 7. Componentes principais

| Componente | Papel |
|---|---|
| `Hero` | Arte da campanha com rotação de fotos a cada 5 min |
| `MapaRegioes` / `Mapa3D` | Mapa do Centro-Oeste em 3D (three.js) com pinos clicáveis; SVG no mobile |
| `LeadForm` | Formulário em 2 etapas, máscara de WhatsApp, LGPD, UTM e pré-seleção por hash |
| `WhatsFlutuante` | Chat flutuante que pergunta a região e roteia ao WhatsApp certo |
| `DepoimentosSection` | Avaliações reais de famílias em esteiras |
| `FaqSection` | 9 perguntas frequentes com schema FAQPage |
| `Constelacao` | Partículas em canvas nas seções escuras |
| `PainelLeads` | Tabela, filtros, modal de detalhes, CSV e reenvio |

---

## 8. SEO e GEO

- **Páginas indexáveis:** 46 (home + 6 regiões + 39 unidades)
- **Dados estruturados:** `EducationalOrganization` (home), `School` +
  `BreadcrumbList` (unidades), `ItemList` (regiões), `FAQPage` (FAQ)
- **Metadados:** títulos e descrições por cidade, canonical, Open Graph,
  keywords, `max-image-preview:large`
- **Medição:** GA4 com `generate_lead` e `whatsapp_click`; Meta Pixel com
  `Lead` e `Contact` (quando o ID estiver configurado)

**Posicionamento:** os concorrentes fortes de cada praça (Sigma, Olimpo,
Galois e Marista no DF; WR e Agostiniano em GO; Classe A e Salesiano em MS;
Ibero Americano em MT; Olimpo Integral e COC em TO) vendem nota no ENEM ou
tradição católica. O espaço livre, e a nossa aposta, é **ensino forte +
valores cristãos + acesso**.

---

## 9. Histórico do que foi construído

1. **Extração de dados** do site antigo (ucob.efcx.pro) e reconciliação com a
   lista oficial: 39 escolas, endereços, fotos e WhatsApps por região
2. **Identidade visual** a partir dos PSDs da campanha (recorte de alunos com
   máscara, slogan, selo 130 anos, fundos)
3. **Home e páginas de região** com hero, mapa 3D, níveis, diferenciais,
   galeria e depoimentos reais
4. **Funil de leads**: formulário em 2 etapas, API, banco, página de obrigado e
   chat flutuante de WhatsApp por região
5. **Painel de leads** com login, resumo, filtros, modal, CSV e reenvio
6. **Integração Sevenbee** (push na hora) e webhook de retorno com status de
   atendimento
7. **SEO/GEO**: páginas por escola, FAQ, schemas, sitemap, robots e GA4
8. **Campanha**: captura de UTM, eventos de conversão, Meta Pixel, 404,
   favicon e reenvio automático
9. **Polimento visual** guiado por referências (land-book, Refero) e por
   revisão tela a tela
10. **IABC**: foto aérea do campus, carrossel da vida no internato e captação
    de lead própria

---

## 10. Pendências

**Dependem de terceiros**

- [ ] WhatsApp regional do Leste Mato-Grossense (ALM)
- [ ] Confirmar os números de MS e Oeste MT (parecem faltar um dígito)
- [ ] Token da API do Sevenbee (`pn_...`)
- [ ] Nameservers do domínio → Cloudflare (`arely.ns.cloudflare.com`,
      `kobe.ns.cloudflare.com`)
- [ ] Contratar a VPS e instalar o Coolify
- [ ] Fotos próprias de 5 unidades (Valparaíso, Porangatu, Goianiense, Sinop e
      Várzea Grande) e autorização da foto de Rondonópolis
- [ ] Dados acadêmicos (aprovações, ENEM, olimpíadas) para a prova de ensino
- [ ] Mutirão de avaliações no Google por unidade
- [ ] ID do Meta Pixel

**Prontos para eu executar**

- [ ] Guia de conteúdo (6 a 8 artigos) para busca informacional e GEO
- [ ] Seção de investimento (captura a busca "quanto custa")
- [ ] Arte dedicada de compartilhamento (og:image 1200×630)
- [ ] Auditoria de performance (Lighthouse)
- [ ] Vídeo de intro via Magnific

---

## 11. Comandos úteis

```bash
npm run build                     # build de produção
npm run lint                      # lint
docker compose up -d --build      # espelho da produção
psql "$DATABASE_URL" -f db/schema.sql   # criar/atualizar as tabelas
```
