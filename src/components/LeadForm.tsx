"use client";

import { useMemo, useState } from "react";
import { PartyPopper } from "lucide-react";
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
}

type Status = "idle" | "enviando" | "ok" | "erro";

const NIVEIS = [
  "Educação Infantil",
  "Ensino Fundamental I (1º ao 5º ano)",
  "Ensino Fundamental II (6º ao 9º ano)",
  "Ensino Médio",
];

const QUALQUER_UNIDADE = "__qualquer__";

export default function LeadForm({ estados, estadoInicial }: Props) {
  const [estado, setEstado] = useState(estadoInicial ?? "");
  const [escola, setEscola] = useState(QUALQUER_UNIDADE);
  const [nivel, setNivel] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [erro, setErro] = useState("");

  const escolas = useMemo(
    () => estados.find((e) => e.slug === estado)?.escolas ?? [],
    [estados, estado],
  );

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const dados = Object.fromEntries(new FormData(form).entries());
    dados.estado = estado;
    dados.escola = escola === QUALQUER_UNIDADE ? "" : escola;
    dados.nivel = nivel;
    setStatus("enviando");
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
      setStatus("ok");
      form.reset();
    } catch (e) {
      setStatus("erro");
      setErro(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente.");
    }
  }

  if (status === "ok") {
    return (
      <Card className="rounded-2xl border-brand-100 shadow-card text-center">
        <CardContent className="p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold-200">
            <PartyPopper aria-hidden className="size-8 text-brand-700" />
          </div>
          <h3 className="text-2xl font-extrabold text-brand-900">
            Recebemos seu interesse!
          </h3>
          <p className="mt-3 text-muted-foreground">
            A equipe da unidade entrará em contato pelo WhatsApp informado. Fique
            de olho no seu telefone.
          </p>
          <Button
            variant="link"
            className="mt-4 font-bold text-brand-600"
            onClick={() => setStatus("idle")}
          >
            Enviar outro contato
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-brand-100 shadow-card">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
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
            <div className="grid gap-2">
              <Label htmlFor="lead-whatsapp">WhatsApp*</Label>
              <Input
                id="lead-whatsapp"
                name="whatsapp"
                required
                maxLength={20}
                inputMode="tel"
                placeholder="(61) 99999-9999"
                className="h-12 rounded-xl"
              />
            </div>
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Região*</Label>
              <Select
                value={estado || undefined}
                onValueChange={(v) => {
                  setEstado(v ?? "");
                  setEscola(QUALQUER_UNIDADE);
                }}
                required
              >
                <SelectTrigger className="h-12 w-full rounded-xl">
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((e) => (
                    <SelectItem key={e.slug} value={e.slug}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Escola de interesse</Label>
              <Select
                value={escola}
                onValueChange={(v) => setEscola(v ?? QUALQUER_UNIDADE)}
                disabled={escolas.length === 0}
              >
                <SelectTrigger className="h-12 w-full rounded-xl">
                  <SelectValue placeholder="Ainda não sei" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QUALQUER_UNIDADE}>
                    Ainda não sei / qualquer unidade
                  </SelectItem>
                  {escolas.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          {status === "erro" && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {erro}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={status === "enviando"}
            className="mt-1 h-14 rounded-full text-base font-bold shadow-cta"
          >
            {status === "enviando" ? "Enviando..." : "Quero garantir minha vaga"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
