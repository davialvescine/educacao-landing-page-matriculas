import nodemailer from "nodemailer";
import { SITE_NOME } from "@/lib/site";

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

export async function enviarEmail(opcoes: {
  para: string;
  assunto: string;
  html: string;
  texto: string;
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
