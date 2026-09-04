import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRede, getRegioesSite } from "@/lib/rede";

export default function Footer() {
  const rede = getRede();
  return (
    <footer className="mt-auto bg-brand-950 text-primary-foreground/70">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-3">
        <div>
          <Image
            src="/imagens/logos/logo_colegio.png"
            alt="Educação Adventista"
            width={170}
            height={50}
            className="h-10 w-auto"
          />
          <p className="mt-5 text-sm leading-relaxed">
            Rede de Educação Adventista no Centro-Oeste brasileiro. Da Educação
            Infantil ao Ensino Médio, educando gerações com valores pra vida.
          </p>
          <Image
            src="/imagens/campanha/muito-alem-do-ensino.png"
            alt="#MuitoAlémdoEnsino"
            width={1617}
            height={122}
            className="mt-5 h-4 w-auto brightness-0 invert"
          />
        </div>
        <div>
          <h3 className="font-bold text-primary-foreground">Nossas regiões</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {getRegioesSite().map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/${e.slug}`}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {e.nome} ({e.uf})
                </Link>
              </li>
            ))}
            <li>
              <a
                href={rede.iabc.site}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary-foreground"
              >
                IABC · Internato
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-primary-foreground">Matrículas</h3>
          <p className="mt-4 text-sm leading-relaxed">
            Preencha o formulário de interesse e a equipe da unidade mais próxima
            entrará em contato com você.
          </p>
          <Link
            href="/#matricula"
            className={cn(
              buttonVariants(),
              "mt-5 h-11 rounded-full bg-gold-400 px-6 font-bold text-brand-950 hover:bg-gold-300",
            )}
          >
            Deixar meu contato
          </Link>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs">
          <span>
            © {new Date().getFullYear()} Educação Adventista Centro-Oeste.
            Todos os direitos reservados.
          </span>
          <span>Educando para esta vida e para a eternidade.</span>
        </div>
      </div>
    </footer>
  );
}
