import nodemailer from "nodemailer";
import { join } from "node:path";
import { SITE_NOME, SITE_URL } from "@/lib/site";

/**
 * Envio de e-mail por SMTP (funciona com Google Workspace, Zoho, Amazon SES
 * e afins). Sem SMTP_HOST configurado, o envio é ignorado e o painel esconde
 * o "esqueci minha senha": o administrador cadastra a senha manualmente.
 */

export function emailConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USUARIO);
}

function transporte() {
  const porta = Number(process.env.SMTP_PORTA ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: porta,
    secure: porta === 465, // 465 = TLS direto; 587 = STARTTLS
    auth: {
      user: process.env.SMTP_USUARIO,
      pass: process.env.SMTP_SENHA,
    },
  });
}

export interface ImagemEmbutida {
  /** Caminho do arquivo dentro de public/. */
  caminho: string;
  /** Identificador usado no HTML como src="cid:..." */
  cid: string;
}

export async function enviarEmail(opcoes: {
  para: string;
  assunto: string;
  html: string;
  texto: string;
  /** Peças da campanha embutidas na mensagem: aparecem mesmo antes de o
   *  site estar publicado e sobrevivem ao bloqueio de imagem externa. */
  imagens?: ImagemEmbutida[];
}): Promise<boolean> {
  if (!emailConfigurado()) {
    console.warn("[email] SMTP não configurado; envio ignorado.");
    return false;
  }
  try {
    await transporte().sendMail({
      from: process.env.SMTP_REMETENTE ?? `"${SITE_NOME}" <${process.env.SMTP_USUARIO}>`,
      to: opcoes.para,
      subject: opcoes.assunto,
      text: opcoes.texto,
      html: opcoes.html,
      attachments: opcoes.imagens?.map((img) => ({
        path: join(process.cwd(), "public", img.caminho),
        cid: img.cid,
        contentDisposition: "inline" as const,
      })),
    });
    return true;
  } catch (e) {
    console.error("[email] falha ao enviar:", e);
    return false;
  }
}

/** E-mail de redefinição de senha do painel. */
export async function enviarRedefinicaoSenha(
  para: string,
  nome: string,
  link: string,
): Promise<boolean> {
  const primeiroNome = nome.split(" ")[0] || nome;
  const texto = [
    `Olá, ${primeiroNome}!`,
    "",
    `Recebemos um pedido para redefinir a sua senha do painel de leads da ${SITE_NOME}.`,
    "",
    "Abra o endereço abaixo para cadastrar uma nova senha (o link vale por 1 hora):",
    link,
    "",
    "Se não foi você quem pediu, ignore esta mensagem: sua senha continua a mesma.",
  ].join("\n");

  const html = `
<div style="margin:0;padding:32px 16px;background:#f4f6ff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(5,12,66,0.10)">
    <div style="background:#050c42;padding:24px 32px">
      <p style="margin:0;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase">
        ${SITE_NOME}
      </p>
    </div>
    <div style="padding:32px">
      <h1 style="margin:0 0 16px;font-size:22px;color:#050c42">Redefinir sua senha</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a5578">
        Olá, ${primeiroNome}! Recebemos um pedido para redefinir a sua senha do
        painel de leads.
      </p>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a5578">
        Clique no botão abaixo para cadastrar uma nova senha. O link vale por 1 hora.
      </p>
      <a href="${link}"
         style="display:inline-block;background:#f8c038;color:#050c42;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:999px">
        Cadastrar nova senha
      </a>
      <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#8792b0">
        Se não foi você quem pediu, pode ignorar esta mensagem: sua senha
        continua a mesma.
      </p>
    </div>
  </div>
</div>`.trim();

  return enviarEmail({
    para,
    assunto: "Redefinir a senha do painel de leads",
    html,
    texto,
  });
}


/* ------------------------------------------------------------------ *
 *  Confirmação para a família, na identidade da campanha
 *
 *  Construído em tabelas com estilo inline: é o que Gmail, Outlook e os
 *  apps de celular renderizam sem quebrar. As peças da campanha vão
 *  embutidas na mensagem (cid:), então aparecem mesmo com o site fora do
 *  ar e sobrevivem ao bloqueio de imagem externa.
 *
 *  Degradações aceitas no Outlook para Windows: cantos arredondados viram
 *  retos e o gradiente do topo vira o dourado chapado do bgcolor.
 * ------------------------------------------------------------------ */

const OURO = "#f8c038";
const OURO_TEXTO = "#a8700a";
const NAVY = "#0e1330";
const AZUL = "#12269e";
const TINTA = "#565f82";
const APAGADO = "#8a92ad";
const CREME = "#faf6ed";
const FIO = "#f1ece2";

/** Pilha de fontes que imita o Plus Jakarta Sans onde ele não existe. */
const FONTE =
  "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const ROTULO = `font:700 10.5px/1.4 ${FONTE};letter-spacing:.18em;text-transform:uppercase;color:${OURO_TEXTO}`;

/** Glifo do WhatsApp, o mesmo que o site usa no botão flutuante. */
const ICONE_WHATSAPP = `<svg width="18" height="18" viewBox="0 0 448 512" fill="#ffffff" style="vertical-align:-3px"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

/** Peças fixas, iguais em toda mensagem. */
const PECAS: ImagemEmbutida[] = [
  { caminho: "imagens/email/logo.png", cid: "ea-logo" },
  { caminho: "imagens/email/selo-130.png", cid: "ea-selo" },
  { caminho: "imagens/email/alunos.jpg", cid: "ea-alunos" },
  { caminho: "imagens/email/aluna.png", cid: "ea-aluna" },
];

function escapar(v: string): string {
  return v.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}

/** Uma linha do recibo: rótulo à esquerda, valor à direita. */
function linhaRecibo(rotulo: string, valor: string, ultima = false): string {
  const borda = ultima ? "" : `border-bottom:1px solid ${FIO};`;
  return `
        <tr>
          <td style="padding:14px 0;${borda}${ROTULO}" valign="top" width="38%">${rotulo}</td>
          <td style="padding:14px 0;${borda}font:600 15px/1.45 ${FONTE};color:${NAVY};text-align:right"
              valign="top">${escapar(valor)}</td>
        </tr>`;
}

/** Um passo da lista "como segue daqui". */
function passo(n: string, titulo: string, texto: string): string {
  return `
        <tr>
          <td width="30" valign="top" style="padding:0 14px 19px 0;font:700 13px/1.55 ${FONTE};color:#d9930a">${n}</td>
          <td valign="top" style="padding:0 0 19px;font:400 15.5px/1.6 ${FONTE};color:${TINTA}">
            <strong style="color:${NAVY};font-weight:600">${titulo}</strong> ${texto}
          </td>
        </tr>`;
}

export interface EscolaEmail {
  nome: string;
  /** Caminho da foto já no tamanho de e-mail, dentro de public/. */
  foto: string | null;
}

/**
 * Confirmação para a família logo depois do cadastro.
 * O e-mail é opcional no formulário, então só sai quando a pessoa informou um.
 * Falha de envio nunca derruba o lead: o retorno é apenas informativo.
 */
export async function enviarConfirmacaoLead(dados: {
  para: string;
  nome: string;
  /** Como a região aparece na frase: "em Goiás", "do IABC". */
  equipe: string;
  /** Nome da região, para o recibo. */
  regiao: string;
  whatsapp: string | null;
  /** Telefone que a família digitou, devolvido para conferência. */
  telefone: string;
  nivel?: string;
  escola?: EscolaEmail;
}): Promise<boolean> {
  const primeiroNome = dados.nome.split(" ")[0] || dados.nome;
  // "Escola Adventista" pede artigo feminino; colégio e instituto, masculino.
  const artigo = /^escola\b/i.test(dados.escola?.nome ?? "") ? "a" : "o";
  const sobre = dados.escola
    ? `sobre ${artigo} ${dados.escola.nome}`
    : `sobre as escolas ${dados.equipe}`;

  const imagens = [...PECAS];
  if (dados.escola?.foto) {
    imagens.push({ caminho: dados.escola.foto, cid: "ea-unidade" });
  }

  /* ---------------- versão em texto puro ---------------- */
  const texto = [
    `Olá, ${primeiroNome}!`,
    "",
    `Recebemos o seu contato ${sobre}. A nossa equipe ${dados.equipe} vai falar com`,
    "você pelo WhatsApp nas próximas horas, para tirar dúvidas e explicar como",
    "funciona a matrícula para 2027.",
    "",
    "O QUE VOCÊ NOS ENVIOU",
    `Nome: ${dados.nome}`,
    `WhatsApp: ${dados.telefone}`,
    `E-mail: ${dados.para}`,
    ...(dados.escola ? [`Escola: ${dados.escola.nome}`] : []),
    `Região: ${dados.regiao}`,
    ...(dados.nivel ? [`Nível: ${dados.nivel}`] : []),
    "",
    "Algum dado saiu errado? É só responder este e-mail que a gente corrige.",
    "",
    ...(dados.whatsapp
      ? ["Se preferir adiantar a conversa, fale com a gente agora:", dados.whatsapp, ""]
      : []),
    "COMO SEGUE DAQUI",
    "1. A gente te chama no WhatsApp para entender a série e o que a sua família procura.",
    "2. Você conhece a escola por dentro, numa visita marcada com a coordenação.",
    "3. A matrícula sai com a nossa ajuda, do primeiro documento à primeira aula.",
    "",
    `Educando gerações com valores pra vida. #MuitoAlémdoEnsino`,
    `${SITE_NOME} — ${SITE_URL}`,
    "",
    "Você recebeu esta mensagem porque pediu contato no nosso site.",
    "Se não foi você, responda este e-mail que apagamos os seus dados.",
  ].join("\n");

  /* ---------------- blocos do HTML ---------------- */
  const blocoEscola = dados.escola
    ? `
      <tr><td class="pad" style="padding:34px 46px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="background:${CREME};border:1px solid #eee0c4;border-radius:26px">
          <tr><td style="padding:10px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#ffffff;border-radius:17px">
              <tr>
                ${
                  dados.escola.foto
                    ? `<td width="186" valign="middle" style="padding:18px 0 18px 18px">
                  <img src="cid:ea-unidade" width="186" height="176" alt=""
                       style="display:block;border:0;border-radius:13px;width:186px;height:176px;object-fit:cover">
                </td>`
                    : ""
                }
                <td valign="middle" style="padding:18px 22px">
                  <p style="margin:0 0 9px;${ROTULO}">A sua escola</p>
                  <p style="margin:0 0 7px;font:800 21px/1.2 ${FONTE};letter-spacing:-.5px;color:${NAVY}">
                    ${escapar(dados.escola.nome)}
                  </p>
                  ${
                    dados.nivel
                      ? `<p style="margin:0;font:400 14.5px/1.55 ${FONTE};color:${APAGADO}">${escapar(dados.nivel)}</p>`
                      : ""
                  }
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  const botao = dados.whatsapp
    ? `
      <tr><td class="pad" style="padding:34px 46px 0" align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" bgcolor="${AZUL}" style="border-radius:9999px">
            <a href="${dados.whatsapp}"
               style="display:block;padding:18px 28px;font:700 16px/1 ${FONTE};color:#ffffff;
                      text-decoration:none;border-radius:9999px">
              ${ICONE_WHATSAPP} &nbsp;Falar agora no WhatsApp
            </a>
          </td></tr>
        </table>
        <p style="margin:15px 0 0;font:400 13.5px/1.6 ${FONTE};color:${APAGADO}">
          Atendimento da nossa equipe ${dados.equipe}, de segunda a sexta.
        </p>
      </td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Recebemos o seu contato</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  @media (max-width:620px){
    .env{padding:0!important}
    .cartao{border-radius:0!important}
    .pad{padding-left:26px!important;padding-right:26px!important}
    .titulo{font-size:27px!important}
    .foto-unidade{width:120px!important;height:114px!important}
    .assina{font-size:19px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#efe9dd;-webkit-font-smoothing:antialiased">

<div style="display:none;max-height:0;overflow:hidden;opacity:0">
  A nossa equipe ${dados.equipe} fala com você pelo WhatsApp nas próximas horas.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe9dd">
<tr><td align="center" class="env" style="padding:34px 12px">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="cartao"
         style="width:600px;max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">

    <!-- Lockup da campanha -->
    <tr>
      <td bgcolor="${OURO}"
          style="background-color:${OURO};
                 background-image:linear-gradient(105deg,#f8e068 0%,${OURO} 55%,#f5a81a 100%);
                 padding:30px 46px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle">
              <img src="cid:ea-logo" width="182" height="38" alt="${SITE_NOME}"
                   style="display:block;border:0;width:182px;height:auto">
            </td>
            <td valign="middle" align="right">
              <img src="cid:ea-selo" width="108" height="35" alt="130 anos"
                   style="display:block;border:0;width:108px;height:auto">
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Tarja -->
    <tr>
      <td bgcolor="${NAVY}" align="center"
          style="background-color:${NAVY};padding:13px 20px;font:700 10.5px/1.4 ${FONTE};
                 letter-spacing:.2em;text-transform:uppercase;color:${OURO}">
        Matrículas abertas &nbsp;&#10022;&nbsp; 2027 &nbsp;&#10022;&nbsp; 39 escolas no Centro-Oeste
      </td>
    </tr>

    <!-- Foto -->
    <tr>
      <td style="font-size:0;line-height:0">
        <img src="cid:ea-alunos" width="600" height="262" alt="Alunos da Educação Adventista"
             style="display:block;border:0;width:100%;max-width:600px;height:auto">
      </td>
    </tr>

    <!-- Abertura -->
    <tr>
      <td class="pad" style="padding:50px 46px 0">
        <p style="margin:0 0 24px;font:400 17px/1.7 ${FONTE};color:${TINTA}">Olá, ${escapar(primeiroNome)}.</p>
        <h1 class="titulo" style="margin:0 0 22px;font:800 35px/1.1 ${FONTE};letter-spacing:-1.2px;color:${NAVY}">
          Recebemos o seu contato.
        </h1>
        <p style="margin:0;font:400 17px/1.72 ${FONTE};color:${TINTA}">
          A nossa equipe <strong style="color:${NAVY};font-weight:600">${dados.equipe}</strong> vai falar
          com você pelo WhatsApp nas próximas horas, para tirar dúvidas ${sobre} e explicar como
          funciona a matrícula para 2027.
        </p>
      </td>
    </tr>
    ${blocoEscola}

    <!-- Recibo -->
    <tr>
      <td class="pad" style="padding:34px 46px 0">
        <p style="margin:0 0 14px;${ROTULO}">O que você nos enviou</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="border-top:1px solid ${FIO}">
          ${linhaRecibo("Nome", dados.nome)}
          ${linhaRecibo("WhatsApp", dados.telefone)}
          ${linhaRecibo("E-mail", dados.para)}
          ${linhaRecibo("Região", dados.regiao, !dados.nivel)}
          ${dados.nivel ? linhaRecibo("Nível", dados.nivel, true) : ""}
        </table>
        <p style="margin:16px 0 0;font:400 13px/1.6 ${FONTE};color:#a0a6bd">
          Algum dado saiu errado? É só responder este e-mail que a gente corrige.
        </p>
      </td>
    </tr>
    ${botao}

    <!-- Como segue daqui -->
    <tr>
      <td class="pad" style="padding:40px 46px 50px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="border-top:1px solid ${FIO};padding-top:32px">
            <p style="margin:0 0 22px;${ROTULO}">Como segue daqui</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${passo("01", "A gente te chama no WhatsApp", "para entender a série e o que a sua família procura.")}
              ${passo("02", "Você conhece a escola por dentro,", "numa visita marcada com a coordenação.")}
              ${passo("03", "A matrícula sai com a nossa ajuda,", "do primeiro documento à primeira aula.")}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- Assinatura da campanha -->
    <tr>
      <td bgcolor="${OURO}"
          style="background-color:${OURO};
                 background-image:linear-gradient(105deg,#f8e068 0%,${OURO} 58%,#f5b31c 100%)">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="bottom" class="pad" style="padding:0 0 44px 46px">
              <p class="assina" style="margin:0 0 10px;font:800 23px/1.22 ${FONTE};letter-spacing:-.7px;color:${NAVY}">
                Educando gerações<br>com valores pra vida
              </p>
              <p style="margin:0;font:italic 700 14.5px/1.5 ${FONTE};color:#8a5a05">#MuitoAlémdoEnsino</p>
            </td>
            <td valign="bottom" align="right" width="152" style="font-size:0;line-height:0">
              <img src="cid:ea-aluna" width="152" height="233" alt=""
                   style="display:block;border:0;width:152px;height:auto">
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Rodapé -->
    <tr>
      <td bgcolor="${NAVY}" align="center" class="pad"
          style="background-color:${NAVY};padding:32px 46px 34px">
        <p style="margin:0 0 6px;font:600 14px/1.5 ${FONTE};color:#ffffff">${SITE_NOME}</p>
        <p style="margin:0 0 18px;font:400 13.5px/1.5 ${FONTE}">
          <a href="${SITE_URL}" style="color:${OURO};text-decoration:none">${SITE_URL.replace(/^https?:\/\//, "")}</a>
        </p>
        <p style="margin:0;font:400 12px/1.7 ${FONTE};color:rgba(255,255,255,0.45)">
          Você recebeu esta mensagem porque pediu contato no nosso site.<br>
          Se não foi você, responda este e-mail que apagamos os seus dados.
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>
</body></html>`;

  return enviarEmail({
    para: dados.para,
    assunto: `Recebemos o seu contato, ${primeiroNome} — Matrículas 2027`,
    html,
    texto,
    imagens,
  });
}
