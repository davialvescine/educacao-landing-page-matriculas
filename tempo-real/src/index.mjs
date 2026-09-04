/**
 * Serviço de tempo real do painel.
 *
 * Duas metades, e as duas importam:
 *
 *  ida    o Postgres avisa (LISTEN leads_mudou) e o evento cai nas telas
 *         de quem pode ver aquela região
 *  volta  a tela avisa que alguém está olhando um lead, e pede para pegar
 *         o atendimento
 *
 * A volta é o que justifica o socket. Só ida daria para fazer com SSE e
 * sem processo separado. O que a mão dupla compra é impedir o dano antes
 * dele acontecer: a coordenadora vê "a Fulana está neste lead" enquanto a
 * Fulana ainda está lendo, e não depois de as duas já terem mandado
 * mensagem para a mesma família.
 */
import { createServer } from "node:http";
import { Server } from "socket.io";
import pg from "pg";
import { podeVer, tokenDoCookie, usuarioDaSessao } from "./sessao.mjs";

const PORTA = Number(process.env.PORTA ?? 3801);
const ORIGEM = process.env.ORIGEM ?? "http://localhost:3000";
const CANAL = "leads_mudou";

if (!process.env.DATABASE_URL) {
  console.error("[tempo-real] sem DATABASE_URL. O painel funciona sem mim.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });

const http = createServer((req, res) => {
  // Só existe para o healthcheck do container. O resto é WebSocket.
  if (req.url === "/saude") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, conectados: io.engine.clientsCount }));
    return;
  }
  res.writeHead(404).end();
});

const io = new Server(http, {
  cors: { origin: ORIGEM, credentials: true },
  // O cookie de sessão só viaja se o cliente pedir; sem isto o handshake
  // chega sem cabeçalho nenhum e ninguém entra.
  allowRequest: (_req, ok) => ok(null, true),
});

/** Quem está olhando cada lead agora. Vive só na memória, e é o certo:
 *  presença é estado do instante — servidor que reinicia zera, e é isso
 *  mesmo que tem de acontecer. */
const olhando = new Map(); // leadId -> Map<socketId, {id, nome}>

io.use(async (socket, next) => {
  try {
    const token = tokenDoCookie(socket.handshake.headers.cookie);
    const usuario = await usuarioDaSessao(pool, token);
    if (!usuario) return next(new Error("sem sessão"));
    socket.data.usuario = usuario;
    next();
  } catch (e) {
    console.error("[tempo-real] falha ao conferir sessão:", e);
    next(new Error("sem sessão"));
  }
});

io.on("connection", (socket) => {
  const usuario = socket.data.usuario;

  socket.emit("pronto", { nome: usuario.nome, admin: usuario.admin });
  anunciarPresenca();

  // ---- volta: quem está olhando o quê -------------------------------
  socket.on("lead:olhando", (leadId) => {
    if (typeof leadId !== "string") return;
    sairDeTudo(socket);
    if (!olhando.has(leadId)) olhando.set(leadId, new Map());
    olhando.get(leadId).set(socket.id, { id: usuario.id, nome: usuario.nome });
    anunciarOlhares(leadId);
  });

  socket.on("lead:largou", () => {
    sairDeTudo(socket);
  });

  // ---- volta: pegar o atendimento -----------------------------------
  //
  // A garantia contra atendimento duplicado NÃO é o socket: é o UPDATE
  // condicional abaixo. O socket só encurta a janela. Se as duas
  // clicarem no mesmo milissegundo, o banco decide, e a segunda recebe
  // `pego: false` com o nome de quem ganhou.
  socket.on("lead:pegar", async (leadId, responder) => {
    const resposta = typeof responder === "function" ? responder : () => {};
    if (typeof leadId !== "string") return resposta({ pego: false });
    try {
      const { rows } = await pool.query(
        `UPDATE leads
            SET atendente_id = $1, atendente_nome = $2, atendente_em = now(),
                atendimento_status = CASE
                  WHEN atendimento_status = 'aguardando' THEN 'em_atendimento'
                  ELSE atendimento_status END
          WHERE id = $3 AND atendente_id IS NULL
          RETURNING id`,
        [usuario.id, usuario.nome, leadId],
      );
      if (rows.length) {
        // O gatilho do banco já avisa todas as telas: não repasso aqui.
        await registrar(usuario, "pegou_lead", leadId);
        return resposta({ pego: true });
      }
      const { rows: dono } = await pool.query(
        `SELECT atendente_nome FROM leads WHERE id = $1`,
        [leadId],
      );
      resposta({ pego: false, de: dono[0]?.atendente_nome ?? "" });
    } catch (e) {
      console.error("[tempo-real] falha ao pegar lead:", e);
      resposta({ pego: false, erro: true });
    }
  });

  socket.on("disconnect", () => {
    sairDeTudo(socket);
    anunciarPresenca();
  });
});

function sairDeTudo(socket) {
  for (const [leadId, pessoas] of olhando) {
    if (!pessoas.delete(socket.id)) continue;
    if (pessoas.size === 0) olhando.delete(leadId);
    anunciarOlhares(leadId);
  }
}

function anunciarOlhares(leadId) {
  const pessoas = [...(olhando.get(leadId)?.values() ?? [])];
  io.emit("lead:olhares", { leadId, pessoas });
}

function anunciarPresenca() {
  const online = [...io.sockets.sockets.values()].map((s) => ({
    id: s.data.usuario.id,
    nome: s.data.usuario.nome,
  }));
  io.emit("presenca", online);
}

async function registrar(usuario, acao, detalhe) {
  await pool
    .query(
      `INSERT INTO acessos (usuario_id, usuario_nome, acao, detalhe)
       VALUES ($1, $2, $3, $4)`,
      [usuario.id, usuario.nome, acao, detalhe],
    )
    .catch((e) => console.error("[tempo-real] falha ao registrar acesso:", e));
}

// ---- ida: o banco avisa, as telas recebem ---------------------------
//
// Conexão dedicada, fora do pool: uma conexão em LISTEN fica ocupada, e
// se o pool a reciclasse no meio, as notificações parariam de chegar sem
// erro nenhum — o pior tipo de falha.
async function escutarBanco() {
  const escuta = new pg.Client({ connectionString: process.env.DATABASE_URL });
  escuta.on("error", (e) => {
    console.error("[tempo-real] conexão de escuta caiu:", e.message);
    setTimeout(escutarBanco, 2000);
  });
  await escuta.connect();
  await escuta.query(`LISTEN ${CANAL}`);
  console.log(`[tempo-real] escutando ${CANAL}`);

  escuta.on("notification", (msg) => {
    let carga;
    try {
      carga = JSON.parse(msg.payload);
    } catch {
      return;
    }
    const lead = carga?.lead;
    if (!lead?.estado) return;
    // Repasse com filtro por socket: coordenadora de Goiás não pode
    // receber lead do Mato Grosso nem por um instante. Emitir para todos
    // e esconder na tela seria vazamento, não interface.
    for (const s of io.sockets.sockets.values()) {
      if (podeVer(s.data.usuario, lead.estado)) {
        s.emit("leads:mudou", carga);
      }
    }
  });
}

escutarBanco().catch((e) => {
  console.error("[tempo-real] não consegui escutar o banco:", e);
  process.exit(1);
});

http.listen(PORTA, () => console.log(`[tempo-real] porta ${PORTA}`));

for (const sinal of ["SIGTERM", "SIGINT"]) {
  process.on(sinal, () => {
    io.close();
    http.close(() => pool.end().then(() => process.exit(0)));
  });
}
