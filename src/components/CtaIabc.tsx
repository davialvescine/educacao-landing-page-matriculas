import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CTA do IABC na home: leva para a landing do internato.
 *
 * Antes apontava para uma âncora do formulário da própria home. A landing
 * do IABC existe justamente para fazer o argumento inteiro — campus,
 * rotina, custo, visita — antes de pedir o contato. Mandar direto ao
 * formulário pulava tudo isso.
 */
export default function CtaIabc() {
  return (
    <Link
      href="/iabc"
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-13 shrink-0 rounded-full bg-gold-400 px-7 font-bold text-brand-950 hover:bg-gold-300",
      )}
    >
      Quero uma vaga no internato
    </Link>
  );
}
