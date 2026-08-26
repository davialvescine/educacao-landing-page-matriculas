"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { FormEstado } from "@/lib/rede";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  /** Nome da escola pré-selecionada (páginas de unidade). */
  escolaInicial?: string;
}

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

  function avancar() {
    if (!estado) {
      setErro("Selecione a sua região para continuar.");
      return;
    }
    setErro("");
    setEtapa(2);
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const dados = Object.fromEntries(new FormData(form).entries());
    dados.estado = estado;
    dados.escola = escola;
    dados.nivel = nivel;
    dados.whatsapp = whatsapp;
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
      router.push(`/obrigado?regiao=${estado}`);
    } catch (e) {
      setEnviando(false);
      setErro(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente.");
    }
  }

  return (
    <Card className="rounded-2xl border-brand-100 shadow-card">
      <CardContent className="p-6 sm:p-8">
        {/* Progresso */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-2 flex-grow overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-gold-400 transition-all duration-500"
              style={{ width: etapa === 1 ? "50%" : "100%" }}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Etapa {etapa} de 2
          </span>
        </div>

        {etapa === 1 ? (
          <div className="grid gap-5">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-brand-900">
                Onde você quer estudar?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Leva menos de um minuto.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Região*</Label>
              <Select
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
                <SelectTrigger className="h-12 w-full rounded-xl">
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
              <Label>Série / nível do aluno</Label>
              <Select value={nivel || undefined} onValueChange={(v) => setNivel(v ?? "")}>
                <SelectTrigger className="h-12 w-full rounded-xl">
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
            <div className="grid gap-2">
              <Label>Escola de interesse</Label>
              <Select
                value={escola || undefined}
                onValueChange={(v) => setEscola(v ?? "")}
                disabled={escolas.length === 0}
              >
                <SelectTrigger className="h-12 w-full rounded-xl">
                  <SelectValue placeholder="Ainda não sei / qualquer unidade" />
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
              className="mt-1 h-14 rounded-full text-base font-bold shadow-cta"
            >
              Continuar
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-brand-900">
                Quase lá! Para onde enviamos as informações?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A equipe da unidade fala com você pelo WhatsApp.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lead-nome">Nome do responsável*</Label>
              <Input
                id="lead-nome"
                name="nome"
                required
                maxLength={120}
                placeholder="Seu nome completo"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lead-whatsapp">WhatsApp*</Label>
                <Input
                  id="lead-whatsapp"
                  name="whatsapp"
                  required
                  inputMode="tel"
                  placeholder="(61) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(mascaraWhatsApp(e.target.value))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-email">E-mail (opcional)</Label>
                <Input
                  id="lead-email"
                  name="email"
                  type="email"
                  maxLength={160}
                  placeholder="voce@email.com"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="lead-lgpd" name="lgpd" required className="mt-0.5" />
              <Label
                htmlFor="lead-lgpd"
                className="text-xs font-normal leading-relaxed text-muted-foreground"
              >
                Autorizo o contato da Educação Adventista pelos dados informados,
                conforme a Lei Geral de Proteção de Dados (LGPD).
              </Label>
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
                className="h-14 shrink-0 rounded-full px-5 font-bold text-brand-700"
              >
                <ArrowLeft aria-hidden className="size-4" />
                Voltar
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={enviando}
                className="h-14 flex-grow rounded-full text-base font-bold shadow-cta"
              >
                {enviando ? "Enviando..." : "Quero garantir minha vaga"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
