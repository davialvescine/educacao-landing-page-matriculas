"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { FormEstado } from "@/lib/rede";
import { eventoLead, lerUtm } from "@/lib/campanha-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { VERSAO_ATUAL } from "@/lib/consentimento";
import { POLITICA_PRIVACIDADE } from "@/lib/site";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  estados: FormEstado[];
  /** Slug do estado pré-selecionado (páginas de região). */
  estadoInicial?: string;
  /** Trava a região e esconde os seletores: usada na página do IABC, onde
   *  a única unidade possível já é a da própria página. */
  regiaoFixa?: boolean;
  /** Nome da escola pré-selecionada (páginas de unidade). */
  escolaInicial?: string;
}

/** Rótulo em negrito, como a família lê num formulário de papel: o nome
 *  do campo é a pergunta, e a pergunta não é letra miúda. */
const ROTULO = "text-base font-extrabold tracking-tight text-brand-950";
/** Campo alto, cantos macios, fundo levemente fora do branco para o
 *  cartão não virar uma parede de caixas brancas sobre branco. */
const CAMPO = "h-14 w-full rounded-2xl border-line bg-paper px-4 text-base";

const NIVEIS = [
  "Educação Infantil",
  "Ensino Fundamental I (1º ao 5º ano)",
  "Ensino Fundamental II (6º ao 9º ano)",
  "Ensino Médio",
];

/** Máscara (61) 99999-9999 aplicada em tempo real. */
function mascaraWhatsApp(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Formulário de lead em 2 etapas: leve primeiro, contato depois. */
export default function LeadForm({
  estados,
  estadoInicial,
  escolaInicial,
  regiaoFixa = false,
}: Props) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [estado, setEstado] = useState(estadoInicial ?? "");
  const [escola, setEscola] = useState(escolaInicial ?? "");
  const [nivel, setNivel] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const escolas = useMemo(
    () => estados.find((e) => e.slug === estado)?.escolas ?? [],
    [estados, estado],
  );

  // Pré-seleção via hash (#matricula-<slug>), ex.: CTA do internato leva a
  // #matricula-iabc. Funciona no clique na mesma página e vindo de outra.
  useEffect(() => {
    const aplicar = () => {
      const m = window.location.hash.match(/^#matricula-([a-z0-9-]+)$/);
      if (!m) return;
      const slug = m[1];
      if (estados.some((e) => e.slug === slug)) {
        setEstado(slug);
        setEscola("");
        document
          .getElementById("matricula")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    };
    aplicar();
    window.addEventListener("hashchange", aplicar);
    return () => window.removeEventListener("hashchange", aplicar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function avancar() {
    if (!estado) {
      setErro("Selecione a sua região para continuar.");
      return;
    }
    // A escola é o que diz qual equipe atende — e, no Mato Grosso, qual das
    // duas associações fica com o lead.
    if (!escola) {
      setErro("Escolha a escola de interesse para continuar.");
      return;
    }
    setErro("");
    setEtapa(2);
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const dados: Record<string, unknown> = Object.fromEntries(
      new FormData(form).entries(),
    );
    dados.estado = estado;
    dados.escola = escola;
    dados.nivel = nivel;
    dados.whatsapp = whatsapp;
    dados.utm = lerUtm();
    // Qual redação a família leu ao aceitar.
    dados.consentimento = VERSAO_ATUAL.versao;
    // Como o aceite foi obtido, para o registro dizer a verdade.
    dados.consentimentoMetodo = "envio";
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.erro ?? "Não foi possível enviar. Tente novamente.");
      }
      eventoLead({ regiao: estado, nivel, escola });
      router.push(`/obrigado?regiao=${estado}`);
    } catch (e) {
      setEnviando(false);
      setErro(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente.");
    }
  }

  return (
    <Card className="rounded-3xl border-brand-100 shadow-card">
      <CardContent className="p-6 sm:p-10">
        {/* Progresso */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-1.5 flex-grow overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-gold-400 transition-all duration-500"
              style={{ width: etapa === 1 ? "50%" : "100%" }}
            />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-900/70">
            Etapa {etapa} de 2
          </span>
        </div>

        {etapa === 1 ? (
          <div className="grid gap-5">
            <div>
              <h3 className="text-2xl font-extrabold leading-tight tracking-tighter text-brand-950 sm:text-3xl">
                {regiaoFixa ? "Vamos começar" : "Onde ele vai estudar?"}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Leva menos de um minuto. Não pedimos dados bancários e não há
                nenhum compromisso.
              </p>
            </div>
            <div className={cn("grid gap-2", regiaoFixa && "hidden")}>
              <Label className={ROTULO}>Região <span className="text-gold-700">*</span></Label>
              <Select
                key={estado || "sem-regiao"}
                value={estado || undefined}
                items={Object.fromEntries(
                  estados.map((e) => [e.slug, `${e.nome} (${e.uf})`]),
                )}
                onValueChange={(v) => {
                  setEstado(v ?? "");
                  setEscola("");
                  setErro("");
                }}
              >
                <SelectTrigger className={CAMPO}>
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((e) => (
                    <SelectItem key={e.slug} value={e.slug}>
                      {e.nome} ({e.uf})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className={ROTULO}>Série em que o aluno vai estudar em 2027</Label>
              <Select value={nivel || undefined} onValueChange={(v) => setNivel(v ?? "")}>
                <SelectTrigger className={CAMPO}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {NIVEIS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={cn("grid gap-2", regiaoFixa && "hidden")}>
              <Label className={ROTULO}>Escola em que deseja matricular <span className="text-gold-700">*</span></Label>
              <Select
                value={escola || undefined}
                onValueChange={(v) => setEscola(v ?? "")}
                disabled={escolas.length === 0}
              >
                <SelectTrigger className={CAMPO}>
                  <SelectValue placeholder="Escolha a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {escolas.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {erro && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            )}
            <Button
              type="button"
              size="lg"
              onClick={avancar}
              className="group mt-2 h-16 rounded-full bg-brand-950 text-base font-bold text-white shadow-cta hover:bg-brand-900"
            >
              Continuar
              <span className="ml-1 flex size-9 items-center justify-center rounded-full bg-white/12 transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight aria-hidden className="size-4" />
              </span>
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5">
            <div>
              <h3 className="text-2xl font-extrabold leading-tight tracking-tighter text-brand-950 sm:text-3xl">
                Quase lá. Para quem a escola liga?
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                A equipe da unidade fala com você pelo WhatsApp.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-nome" className={ROTULO}>Nome do responsável <span className="text-gold-700">*</span></Label>
              <Input
                id="lead-nome"
                name="nome"
                required
                maxLength={120}
                placeholder="Seu nome completo"
                className={cn(CAMPO, "h-12 rounded-xl")}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lead-whatsapp" className={ROTULO}>WhatsApp <span className="text-gold-700">*</span></Label>
                <Input
                  id="lead-whatsapp"
                  name="whatsapp"
                  required
                  inputMode="tel"
                  placeholder="(61) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(mascaraWhatsApp(e.target.value))}
                  className={cn(CAMPO, "h-12 rounded-xl")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-email" className={ROTULO}>E-mail <span className="font-medium text-muted-foreground">(opcional)</span></Label>
                <Input
                  id="lead-email"
                  name="email"
                  type="email"
                  maxLength={160}
                  placeholder="voce@email.com"
                  className={cn(CAMPO, "h-12 rounded-xl")}
                />
              </div>
            </div>
            {/* Aceite pelo envio, acima do botão. O botão é o fim do
                caminho visual do formulário: o que precisa ser lido vem
                antes dele. Depois do botão, a pessoa só encontraria o
                texto depois de já ter consentido. */}
            <div className="rounded-xl border border-line bg-paper px-4 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Ao enviar, você autoriza o contato da Educação Adventista
                sobre a matrícula, com os dados que informou.
              </p>
              <a
                href={POLITICA_PRIVACIDADE}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
              >
                Política de privacidade
              </a>
            </div>
            {erro && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEtapa(1)}
                className="h-16 shrink-0 rounded-full px-5 font-bold text-brand-700"
              >
                <ArrowLeft aria-hidden className="size-4" />
                Voltar
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={enviando}
                className="group h-16 flex-grow rounded-full bg-brand-950 text-base font-bold text-white shadow-cta hover:bg-brand-900"
              >
                {enviando ? "Enviando..." : "Quero garantir minha vaga"}
                {!enviando && (
                  <span className="ml-1 flex size-9 items-center justify-center rounded-full bg-white/12 transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight aria-hidden className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
