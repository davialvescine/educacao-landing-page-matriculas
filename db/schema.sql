-- Tabela de leads da landing de matrículas.
-- Rode uma vez no Postgres criado pelo Coolify:
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id                 uuid PRIMARY KEY,
  nome               text NOT NULL,
  whatsapp           text NOT NULL,
  email              text NOT NULL DEFAULT '',
  estado             text NOT NULL,            -- slug da região (ex.: goias, leste-mt)
  escola             text NOT NULL DEFAULT '', -- escola de interesse
  cidade             text NOT NULL DEFAULT '', -- cidade onde a família mora
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

-- Cidade da família, para bancos criados antes desta versão.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cidade text NOT NULL DEFAULT '';

-- Registro de acesso (LGPD: quem viu e exportou dados de famílias).
CREATE TABLE IF NOT EXISTS acessos (
  id          bigserial PRIMARY KEY,
  usuario_id  text,
  usuario_nome text NOT NULL DEFAULT '',
  acao        text NOT NULL,          -- login | login_falhou | exportou | reenviou
  detalhe     text NOT NULL DEFAULT '',
  ip          text NOT NULL DEFAULT '',
  agente      text NOT NULL DEFAULT '',
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- De onde partiu a ação, para bancos criados antes desta versão. Sem isso
-- a trilha diz que alguém entrou, mas não de onde — e é justamente o "de
-- onde" que distingue a coordenadora viajando de alguém usando a senha
-- dela do outro lado do país.
ALTER TABLE acessos ADD COLUMN IF NOT EXISTS ip text NOT NULL DEFAULT '';
ALTER TABLE acessos ADD COLUMN IF NOT EXISTS agente text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS acessos_criado_em_idx ON acessos (criado_em DESC);

-- Tentativa de entrada é consulta de segurança: "quantas falhas neste
-- e-mail na última hora". Sem índice, isso varre a tabela inteira.
CREATE INDEX IF NOT EXISTS acessos_acao_idx ON acessos (acao, criado_em DESC);

-- ============================================================
-- Aviso de mudança para as telas abertas
--
-- O gatilho dispara em qualquer escrita, venha de onde vier: do
-- formulário, do webhook do Sevenbee, da fila de reenvio ou de um UPDATE
-- feito na mão no banco. Por isso ele mora aqui, e não na aplicação — a
-- aplicação tem quatro caminhos de escrita e esqueceria um.
--
-- O serviço de tempo real escuta este canal e reparte para as telas,
-- filtrando por região: coordenadora de Goiás não recebe lead do MT.
--
-- A carga do NOTIFY tem limite de 8000 bytes, então vão só os campos que
-- a lista mostra. Quem precisar do resto busca.
-- ============================================================
CREATE OR REPLACE FUNCTION leads_avisar() RETURNS trigger AS $$
DECLARE
  linha   record;
  anterior text;
  carga   text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    linha := OLD;
  ELSE
    linha := NEW;
  END IF;

  -- Lead que muda de região precisa sumir da tela de quem via antes.
  -- Sem isto, a coordenação antiga fica com nome e telefone de uma
  -- família que deixou de ser dela.
  IF TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado THEN
    anterior := OLD.estado;
  END IF;

  carga := json_build_object(
    'acao', lower(TG_OP),
    'estado_anterior', anterior,
    'lead', json_build_object(
      'id', linha.id,
      'nome', linha.nome,
      'whatsapp', linha.whatsapp,
      'email', linha.email,
      'estado', linha.estado,
      'escola', linha.escola,
      'nivel', linha.nivel,
      'criado_em', linha.criado_em,
      'webhook_status', linha.webhook_status,
      'atendimento_status', linha.atendimento_status,
      'atendimento_em', linha.atendimento_em
    )
  )::text;

  -- octet_length, e não length: o limite do NOTIFY é em BYTES, e length
  -- conta CARACTERES. Nome com acento passava na conta e estourava no
  -- envio — e o estouro reverte a transação que gravou o lead. Perder o
  -- aviso é aceitável; perder o lead não é.
  IF octet_length(carga) < 7000 THEN
    PERFORM pg_notify('leads_mudou', carga);
  ELSE
    PERFORM pg_notify('leads_mudou',
      json_build_object('acao', 'recarregar', 'estado_anterior', anterior,
        'lead', json_build_object('id', linha.id,
                                  'estado', left(linha.estado, 60)))::text);
  END IF;
  RETURN NULL; -- AFTER trigger: o retorno é ignorado
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_avisar_trg ON leads;
CREATE TRIGGER leads_avisar_trg
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION leads_avisar();

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

-- ============================================================
-- WhatsApp por região, editável no painel.
-- A base continua em src/data/rede.json: esta tabela só guarda o que a
-- coordenação sobrescreveu. Região sem linha aqui usa o número do arquivo.
-- ============================================================
CREATE TABLE IF NOT EXISTS regioes_config (
  slug            text PRIMARY KEY,   -- slug interno (distrito-federal, leste-mt...)
  whatsapp_numero text NOT NULL DEFAULT '',
  atualizado_em   timestamptz NOT NULL DEFAULT now(),
  atualizado_por  text NOT NULL DEFAULT ''
);

-- ============================================================
-- Prova de consentimento (LGPD art. 8º §2º: o ônus é do controlador).
--
-- Tabela própria, e não colunas em leads, por dois motivos: a prova
-- precisa sobreviver à anonimização do lead quando o ciclo encerrar, e
-- registro de consentimento não se atualiza — cada aceite é uma linha
-- nova, imutável.
--
-- Guarda a VERSÃO do texto e o resumo criptográfico dele: a versão diz
-- qual redação a família leu, o resumo prova que aquela redação não foi
-- alterada depois.
-- ============================================================
CREATE TABLE IF NOT EXISTS consentimentos (
  id          bigserial PRIMARY KEY,
  lead_id     uuid NOT NULL,
  versao      text NOT NULL,          -- ex.: 2026-09-1
  texto_hash  text NOT NULL,          -- sha256 do texto exibido
  aceito_em   timestamptz NOT NULL DEFAULT now(),
  ip          text NOT NULL DEFAULT '',
  agente      text NOT NULL DEFAULT '',
  metodo      text NOT NULL DEFAULT 'envio'  -- envio | caixa
);

-- Como o aceite foi obtido, para bancos criados antes desta versão.
ALTER TABLE consentimentos ADD COLUMN IF NOT EXISTS metodo text NOT NULL DEFAULT 'envio';

CREATE INDEX IF NOT EXISTS consentimentos_lead_idx ON consentimentos (lead_id);
CREATE INDEX IF NOT EXISTS consentimentos_versao_idx ON consentimentos (versao);

-- ============================================================
-- Relatórios mensais enviados
--
-- A primeira versão usava a trilha de auditoria como estado da tarefa:
-- "achou um registro do mês, então já foi". Bastava UM dos vinte envios
-- dar certo para os outros dezenove nunca mais saírem. E duas execuções
-- simultâneas passavam as duas pela checagem antes de existir registro.
--
-- Aqui a chave é (ano, mes, usuario_id, tipo): cada pessoa é reivindicada
-- com INSERT ... ON CONFLICT DO NOTHING antes do envio, o que serve de
-- trava por destinatário e por execução ao mesmo tempo. Envio de teste
-- tem tipo próprio, para não ser confundido com o oficial do fechamento.
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios_enviados (
  ano         int  NOT NULL,
  mes         int  NOT NULL,
  usuario_id  text NOT NULL,
  tipo        text NOT NULL DEFAULT 'oficial',  -- oficial | teste
  enviado_em  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ano, mes, usuario_id, tipo)
);

-- Dono do lead saiu do sistema (o atendimento é conduzido no Sevenbee).
-- Banco que chegou a receber as colunas fica limpo também.
ALTER TABLE leads DROP COLUMN IF EXISTS atendente_id;
ALTER TABLE leads DROP COLUMN IF EXISTS atendente_nome;
ALTER TABLE leads DROP COLUMN IF EXISTS atendente_em;
