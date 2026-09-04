"use client";

import { useState } from "react";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RegiaoWhatsapp {
  slug: string;
  nome: string;
  associacao: string;
  /** O que está no ar hoje, já considerando o que foi salvo aqui. */
  numero: string;
  /** true quando o número veio do painel, e não do arquivo do projeto. */
  editado: boolean;
  atualizadoPor?: string;
}

/**
 * WhatsApp de atendimento por região.
 *
 * O site é estático: salvar aqui grava no banco e manda regenerar as
 * páginas, então o número novo entra no ar em segundos, sem publicação.
 * Campo vazio devolve a região ao número que está no arquivo do projeto.
 */
export default function WhatsappRegioes({
  regioes,
}: {
  regioes: RegiaoWhatsapp[];
}) {
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(regioes.map((r) => [r.slug, r.numero])),
  );
  const [salvando, setSalvando] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  async function salvar(slug: string) {
    setSalvando(slug);
    setErro("");
    setSalvo(null);
    try {
      const res = await fetch("/api/painel/regioes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, numero: valores[slug] ?? "" }),
      });
      const dados = await res.json();
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível salvar.");
        return;
      }
      setSalvo(slug);
      setTimeout(() => setSalvo((s) => (s === slug ? null : s)), 4000);
    } catch {
      setErro("Falha de conexão. Tente de novo.");
    } finally {
      setSalvando(null);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <div className="flex items-center gap-2">
        <MessageCircle aria-hidden className="size-5 text-gold-600" />
        <h2 className="text-lg font-extrabold tracking-tight text-brand-900">
          WhatsApp por região
        </h2>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        É o número que atende a família no site: botão da região, cartão de
        cada unidade e barra do celular. Salvou, entra no ar em alguns
        segundos — não precisa de publicação. Deixe em branco para voltar ao
        número que veio no projeto.
      </p>

      {erro && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {regioes.map((r) => (
          <div
            key={r.slug}
            className="flex flex-wrap items-end gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0"
          >
            <div className="min-w-[190px] flex-1">
              <Label htmlFor={`wpp-${r.slug}`} className="text-brand-900">
                {r.nome}
                <span className="ml-2 font-normal text-muted-foreground">
                  {r.associacao}
                </span>
              </Label>
              <Input
                id={`wpp-${r.slug}`}
                value={valores[r.slug] ?? ""}
                onChange={(e) =>
                  setValores((v) => ({ ...v, [r.slug]: e.target.value }))
                }
                placeholder="(65) 99999-0000"
                inputMode="tel"
                className="mt-2 h-11 rounded-xl"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {!valores[r.slug]
                  ? "Sem número: a região fica sem botão de WhatsApp no site."
                  : r.editado
                    ? `Editado no painel${r.atualizadoPor ? ` por ${r.atualizadoPor}` : ""}.`
                    : "Número que veio no projeto."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => salvar(r.slug)}
              disabled={salvando === r.slug}
              className="h-11 rounded-xl"
            >
              {salvando === r.slug ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : salvo === r.slug ? (
                <Check aria-hidden className="size-4 text-emerald-600" />
              ) : null}
              {salvo === r.slug ? "No ar" : "Salvar"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
