import Link from "next/link";

/** Barra de CTA fixa na base, só no mobile, onde vive o tráfego de campanha. */
export default function BarraCtaMobile() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-600/40 bg-brand-700/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <Link
        href="#matricula"
        className="flex h-12 items-center justify-center rounded-full bg-gold-400 text-base font-extrabold text-brand-950 shadow-cta active:scale-[0.98]"
      >
        Garantir minha vaga
      </Link>
    </div>
  );
}
