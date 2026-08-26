import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#regioes", label: "Nossas regiões" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#iabc", label: "IABC" },
];

/** Header transparente sobreposto ao hero, como no site oficial da campanha. */
export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-950/55 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Página inicial">
          <Image
            src="/imagens/logos/logo_colegio.png"
            alt="Educação Adventista"
            width={502}
            height={150}
            className="h-10 w-auto drop-shadow-[0_2px_8px_rgba(120,60,0,0.25)] sm:h-11"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-white md:flex [text-shadow:0_1px_6px_rgba(120,60,0,0.35)]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-opacity hover:opacity-80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href="#matricula"
          className={cn(
            buttonVariants(),
            "h-11 rounded-full px-6 text-sm font-bold shadow-cta",
          )}
        >
          Quero matricular
        </a>
      </div>
    </header>
  );
}
