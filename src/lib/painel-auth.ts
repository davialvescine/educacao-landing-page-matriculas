import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_SESSAO = "painel_sessao";
export const DURACAO_SESSAO_S = 12 * 60 * 60; // 12 horas

function chave(): string {
  return process.env.PAINEL_SENHA ?? "";
}

export function painelConfigurado(): boolean {
  return Boolean(chave());
}

function assinar(exp: number): string {
  return createHmac("sha256", chave()).update(String(exp)).digest("hex");
}

export function criarToken(): string {
  const exp = Date.now() + DURACAO_SESSAO_S * 1000;
  return `${exp}.${assinar(exp)}`;
}

export function senhaConfere(tentativa: string): boolean {
  if (!painelConfigurado()) return false;
  // Hash dos dois lados para comparar em tempo constante sem vazar tamanho.
  const a = createHash("sha256").update(tentativa).digest();
  const b = createHash("sha256").update(chave()).digest();
  return timingSafeEqual(a, b);
}

export function tokenValido(token: string | undefined): boolean {
  if (!token || !painelConfigurado()) return false;
  const [expStr, assinatura] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const esperada = assinar(exp);
  try {
    return timingSafeEqual(
      Buffer.from(assinatura ?? "", "utf8"),
      Buffer.from(esperada, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function sessaoValida(): Promise<boolean> {
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_SESSAO)?.value);
}
