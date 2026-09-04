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
 *
 * REGRA DURA, e ela vale em TODO evento daqui: coordenador só enxerga as
 * regiões atribuídas a ele. Isso inclui presença e "quem está olhando" —
 * um identificador de lead que vaza para outra associação já é vazamento,
 * mesmo sem o nome da família junto. A primeira versão deste arquivo
 * errava exatamente aí, com `io.emit`.
 */
import { createServer } from "node:http";
import { Server } from "socket.io";
import pg from "pg";
import {
  podeVer,
  regiaoDoLead,
  tokenDoCookie,
  usuarioDaSessao,
} from "./sessao.mjs";

const PORTA = Number(process.env.PORTA ?? 3801);
const ORIGEM = process.env.ORIGEM ?? "http://localhost:3000";
const CANAL = "leads_mudou";
/** De quanto em quanto tempo a sessão de quem já está conectado é
 *  reconferida. Sem isso, desativar alguém no painel não o derrubava: ele
 *  seguia recebendo dado de família até fechar a aba. */
const REVALIDAR_MS = Number(process.env.REVALIDAR_MS ?? 60_000);

if (!process.env.DATABASE_URL) {
  console.error("[tempo-real] sem DATABASE_URL. O painel funciona sem mim.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });

/** Estado da escuta, exposto no healthcheck: processo de pé sem LISTEN é
 *  processo que não faz nada, e o orquestrador precisa saber disso. */
const escuta = { ligada: false, cliente: null, religando: false };

const http = createServer((req, res) => {
  if (req.url === "/saude") {
    const ok = escuta.ligada;
    res.writeHead(ok ? 200 : 503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok,
        escutando: escuta.ligada,
        conectados: io.engine.clientsCount,
      }),
    );
    return;
  }
  res.writeHead(404).end();
});

const io = new Server(http, { cors: { origin: ORIGEM, credentials: true } });

/** Quem está olhando cada lead agora, com a região do lead junto — é ela
 *  que decide para quem esse aviso pode ir. Vive só na memória, e é o
 *  certo: presença é estado do instante. */
const olhando = new Map(); // leadId -> { estado, pessoas: Map<socketId, {id,nome}> }

io.use(async (socket, next) => {
  try {
    const token = tokenDoCookie(socket.handshake.headers.cookie);
    const usuario = await usuarioDaSessao(pool, token);
    if (!usuario) return next(new Error("sem sessão"));
    socket.data.usuario = usuario;
    socket.data.token = token;
    next();
  } catch (e) {
    console.error("[tempo-real] falha ao conferir sessão:", e);
    next(new Error("sem sessão"));
  }
});

io.on("connection", (socket) => {
  socket.emit("pronto", {
    nome: socket.data.usuario.nome,
    admin: socket.data.usuario.admin,
  });
  anunciarPresenca();

  // Sessão revalidada de tempos em tempos. Papel e regiões vêm junto: se
  // uma região for tirada de alguém, ele para de receber na hora seguinte
  // em vez de só no próximo login.
  const conferir = setInterval(async () => {
    try {
      const atual = await usuarioDaSessao(pool, socket.data.token);
      if (!atual) {
        socket.emit("sessao:encerrada");
        return socket.disconnect(true);
      }
      socket.data.usuario = atual;
    } catch (e) {
      // Banco fora do ar não derruba quem já está conectado: a próxima
      // volta reconfere. Derrubar aqui transformaria instabilidade de
      // banco em queda de painel.
      console.error("[tempo-real] revalidação falhou:", e.message);
    }
  }, REVALIDAR_MS);

  // ---- volta: quem está olhando o quê -------------------------------
  socket.on("lead:olhando", async (leadId) => {
    const estado = await regiaoDoLead(pool, leadId).catch(() => null);
    if (!estado || !podeVer(socket.data.usuario, estado)) return;
    sairDeTudo(socket);
    if (!olhando.has(leadId)) olhando.set(leadId, { estado, pessoas: new Map() });
    const alvo = olhando.get(leadId);
    alvo.estado = estado;
    alvo.pessoas.set(socket.id, {
      id: socket.data.usuario.id,
      nome: socket.data.usuario.nome,
    });
    anunciarOlhares(leadId);
  });

  socket.on("lead:largou", () => sairDeTudo(socket));

  // ---- volta: pegar o atendimento -----------------------------------
  //
  // A garantia contra atendimento duplicado NÃO é o socket: é o UPDATE
  // condicional. O socket só encurta a janela. Se duas pessoas clicarem
  // no mesmo milissegundo, o banco decide, e a segunda recebe
  // `pego: false` com o nome de quem ganhou.
  socket.on("lead:pegar", async (leadId, responder) => {
    const resposta = typeof responder === "function" ? responder : () => {};
    const usuario = socket.data.usuario;
    try {
      const estado = await regiaoDoLead(pool, leadId);
      // Autorização primeiro, e a mesma condição repetida no WHERE: quem
      // não pode ver a região não pode pegar o lead, e nem descobrir de
      // quem ele é. Sem isto, bastava ter o identificador.
      if (!estado || !podeVer(usuario, estado)) return resposta({ pego: false });

      const { rows } = await pool.query(
        `UPDATE leads
            SET atendente_id = $1, atendente_nome = $2, atendente_em = now(),
                atendimento_status = CASE
                  WHEN atendimento_status = 'aguardando' THEN 'em_atendimento'
                  ELSE atendimento_status END
          WHERE id = $3 AND estado = $4 AND atendente_id IS NULL
          RETURNING id`,
        [usuario.id, usuario.nome, leadId, estado],
      );
      if (rows.length) {
        // O gatilho do banco já avisa todas as telas: não repasso aqui.
        // O registro na trilha não segura a resposta — auditoria lenta
        // não pode virar botão travado.
        registrar(usuario, "pegou_lead", leadId);
        return resposta({ pego: true });
      }
      const { rows: dono } = await pool.query(
        `SELECT atendente_nome FROM leads WHERE id = $1 AND estado = $2`,
        [leadId, estado],
      );
      resposta({ pego: false, de: dono[0]?.atendente_nome ?? "" });
    } catch (e) {
      console.error("[tempo-real] falha ao pegar lead:", e);
      resposta({ pego: false, erro: true });
    }
  });

  socket.on("disconnect", () => {
    clearInterval(conferir);
    sairDeTudo(socket);
    anunciarPresenca();
  });
});

function sairDeTudo(socket) {
  for (const [leadId, alvo] of olhando) {
    if (!alvo.pessoas.delete(socket.id)) continue;
    if (alvo.pessoas.size === 0) {
      olhando.delete(leadId);
      espalhar(alvo.estado, "lead:olhares", { leadId, pessoas: [] });
      continue;
    }
    anunciarOlhares(leadId);
  }
}

function anunciarOlhares(leadId) {
  const alvo = olhando.get(leadId);
  if (!alvo) return;
  espalhar(alvo.estado, "lead:olhares", {
    leadId,
    pessoas: [...alvo.pessoas.values()],
  });
}

/**
 * Presença por região: cada um recebe apenas quem divide alguma região
 * com ele. A lista inteira diria à coordenação de Goiás quem está
 * trabalhando no Mato Grosso.
 */
function anunciarPresenca() {
  const todos = [...io.sockets.sockets.values()];
  for (const s of todos) {
    const visiveis = todos
      .filter((o) => compartilhamRegiao(s.data.usuario, o.data.usuario))
      .map((o) => ({ id: o.data.usuario.id, nome: o.data.usuario.nome }));
    s.emit("presenca", visiveis);
  }
}

function compartilhamRegiao(a, b) {
  if (!a || !b) return false;
  if (a.id === b.id) return true;
  if (a.admin || b.admin) return true;
  return a.regioes.some((r) => b.regioes.includes(r));
}

/** Emite só para quem pode ver a região. É o único caminho de saída de
 *  evento daqui — `io.emit` está proibido de propósito. */
function espalhar(estado, evento, carga) {
  for (const s of io.sockets.sockets.values()) {
    if (podeVer(s.data.usuario, estado)) s.emit(evento, carga);
  }
}

function registrar(usuario, acao, detalhe) {
  pool
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
  // Trava de reentrada: `error` e `end` podem disparar na mesma queda, e
  // sem isto o serviço acabaria com dois clientes em LISTEN, entregando
  // cada evento duas vezes.
  if (escuta.religando) return;
  escuta.religando = true;

  const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
  const cair = (motivo) => {
    if (escuta.cliente !== cliente) return;
    escuta.ligada = false;
    escuta.cliente = null;
    console.error("[tempo-real] escuta caiu:", motivo);
    setTimeout(religar, 2000);
  };
  cliente.on("error", (e) => cair(e.message));
  cliente.on("end", () => cair("conexão encerrada"));

  try {
    await cliente.connect();
    await cliente.query(`LISTEN ${CANAL}`);
  } catch (e) {
    escuta.religando = false;
    cliente.end().catch(() => {});
    console.error("[tempo-real] não consegui escutar:", e.message);
    setTimeout(religar, 2000);
    return;
  }

  escuta.cliente = cliente;
  escuta.ligada = true;
  escuta.religando = false;
  console.log(`[tempo-real] escutando ${CANAL}`);

  cliente.on("notification", (msg) => {
    let carga;
    try {
      carga = JSON.parse(msg.payload);
    } catch {
      return;
    }
    const lead = carga?.lead;
    if (!lead?.estado) return;

    // Lead que mudou de região: quem via antes precisa ser mandado
    // recarregar, senão continua com nome e telefone de uma família que
    // não é mais dele.
    if (carga.estado_anterior && carga.estado_anterior !== lead.estado) {
      espalharSó(carga.estado_anterior, lead.estado, "leads:sumiu", {
        id: lead.id,
      });
    }
    espalhar(lead.estado, "leads:mudou", carga);
  });
}

/** Manda para quem vê `estado` mas NÃO vê `exceto`, para o lead que
 *  mudou de região não chegar duas vezes a quem enxerga as duas. */
function espalharSó(estado, exceto, evento, carga) {
  for (const s of io.sockets.sockets.values()) {
    if (podeVer(s.data.usuario, estado) && !podeVer(s.data.usuario, exceto)) {
      s.emit(evento, carga);
    }
  }
}

/**
 * Volta a escutar e manda todo mundo recarregar. As notificações que
 * aconteceram enquanto a conexão estava fora não voltam — o Postgres não
 * as guarda. Sem este pedido de recarga, a tela ficaria mostrando um
 * passado com cara de presente, que é pior do que mostrar desatualizado
 * e avisar.
 */
function religar() {
  escutarBanco()
    .then(() => {
      if (escuta.ligada) io.emit("recarregar");
    })
    .catch((e) => {
      escuta.religando = false;
      console.error("[tempo-real] religar falhou:", e.message);
      setTimeout(religar, 5000);
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
