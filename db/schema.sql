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

CREATE INDEX IF NOT EXISTS leads_estado_idx ON leads (estado);
CREATE INDEX IF NOT EXISTS leads_criado_em_idx ON leads (criado_em DESC);
CREATE INDEX IF NOT EXISTS leads_webhook_pendente_idx
  ON leads (webhook_status) WHERE webhook_status <> 'enviado';
