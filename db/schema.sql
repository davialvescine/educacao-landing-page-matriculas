-- Tabela de leads da landing de matrículas.
-- Rode uma vez no Postgres criado pelo Coolify:
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id                 uuid PRIMARY KEY,
  nome               text NOT NULL,
  whatsapp           text NOT NULL,
  email              text NOT NULL DEFAULT '',
  estado             text NOT NULL,            -- slug da região (ex.: goias, leste-mt)
  escola             text NOT NULL DEFAULT '', -- escola de interesse (opcional)
  nivel              text NOT NULL DEFAULT '',
  criado_em          timestamptz NOT NULL DEFAULT now(),
  webhook_status     text NOT NULL DEFAULT 'pendente', -- pendente | enviado | falhou:*
  webhook_tentativas int  NOT NULL DEFAULT 0,
  enviado_em         timestamptz,
  atendimento_status text NOT NULL DEFAULT 'aguardando', -- aguardando | em_atendimento | atendido
  atendimento_em     timestamptz,
  utm                jsonb                               -- origem de campanha
);

-- Colunas de atendimento para bancos criados antes desta versão.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS atendimento_status text NOT NULL DEFAULT 'aguardando';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS atendimento_em timestamptz;

-- Origem de campanha (utm_source, utm_medium, utm_campaign, gclid, fbclid...).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm jsonb;

-- Registro de acesso (LGPD: quem viu e exportou dados de famílias).
CREATE TABLE IF NOT EXISTS acessos (
  id          bigserial PRIMARY KEY,
  usuario_id  text,
  usuario_nome text NOT NULL DEFAULT '',
  acao        text NOT NULL,          -- login | login_falhou | exportou | reenviou
  detalhe     text NOT NULL DEFAULT '',
  criado_em   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS acessos_criado_em_idx ON acessos (criado_em DESC);

CREATE INDEX IF NOT EXISTS leads_estado_idx ON leads (estado);
CREATE INDEX IF NOT EXISTS leads_criado_em_idx ON leads (criado_em DESC);
CREATE INDEX IF NOT EXISTS leads_webhook_pendente_idx
  ON leads (webhook_status) WHERE webhook_status <> 'enviado';

-- ============================================================
-- Autenticação do painel (Better Auth) — gerado por
--   npx @better-auth/cli generate --config src/lib/auth.ts
-- Papéis em "user".role: admin | coordenador
-- "user".regioes: regiões visíveis ao coordenador
-- Desativação de acesso: "user".banned
-- ============================================================

create table if not exists "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null, "role" text, "banned" boolean, "banReason" text, "banExpires" timestamptz, "regioes" jsonb);

create table if not exists "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade, "impersonatedBy" text);

create table if not exists "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table if not exists "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

-- Exigida pelo runtime do Better Auth 1.7 (ausente no CLI generate).
alter table "account" add column if not exists "issuer" text;

create index if not exists "session_userId_idx" on "session" ("userId");

create index if not exists "account_userId_idx" on "account" ("userId");

create index if not exists "verification_identifier_idx" on "verification" ("identifier");
