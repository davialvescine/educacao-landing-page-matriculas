/**
 * De onde veio a requisição.
 *
 * Dois registros do sistema dependem disso: o consentimento da família,
 * que precisa provar de onde partiu o aceite, e a trilha de auditoria do
 * painel, que precisa dizer de onde a coordenação entrou. Ficava só no
 * módulo de consentimento; virou lugar próprio quando o segundo apareceu.
 *
 * São funções puras sobre os cabeçalhos, sem acesso a banco, justamente
 * para poderem ser testadas sem subir nada.
 */

/** Primeiro IP da cadeia de proxies, que é o do visitante. */
export function ipDaRequisicao(req: Request): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim().slice(0, 45);
  return req.headers.get("cf-connecting-ip")?.slice(0, 45) ?? "";
}

/**
 * Navegador declarado. Cortado em 300 caracteres: user agent é campo
 * livre que o cliente escolhe, e ninguém legítimo passa disso.
 */
export function agenteDaRequisicao(req: Request): string {
  return (req.headers.get("user-agent") ?? "").slice(0, 300);
}
