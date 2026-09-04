import { notFound } from "next/navigation";

/**
 * Destino das reescritas do proxy quando uma rota não pertence ao domínio
 * que a pediu. Devolve 404 de verdade, com a página de erro do site — em
 * vez de vazar conteúdo do outro projeto.
 */
export default function NaoEncontrado(): never {
  notFound();
}
