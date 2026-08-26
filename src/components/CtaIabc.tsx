import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** CTA do IABC: leva ao formulário já com o internato pré-selecionado. */
export default function CtaIabc() {
  return (
    <a
      href="#matricula-iabc"
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-13 shrink-0 rounded-full bg-gold-400 px-7 font-bold text-brand-950 hover:bg-gold-300",
      )}
    >
      Quero uma vaga no internato
    </a>
  );
}
