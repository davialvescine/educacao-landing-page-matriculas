"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Download,
  Inbox,
  LogOut,
  RefreshCw,
  Send,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeadRegistro, ResumoLeads } from "@/lib/leads";

interface Props {
  leads: LeadRegistro[];
  resumo: ResumoLeads;
  regioes: { slug: string; nome: string }[];
  filtroRegiao: string;
  filtroStatus: string;
  integracaoConfigurada: boolean;
}

const STATUS_FILTROS = [
  { valor: "", rotulo: "Todos" },
  { valor: "enviado", rotulo: "Enviados" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "falhou", rotulo: "Com falha" },
];

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function BadgeStatus({ status }: { status: string }) {
  if (status === "enviado") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
        <Send aria-hidden className="size-3" /> Enviado
      </span>
    );
  }
  if (status === "pendente") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">
        <Inbox aria-hidden className="size-3" /> Recebido
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800"
      title={status}
    >
      <TriangleAlert aria-hidden className="size-3" /> Falha no envio
    </span>
  );
}

export default function PainelLeads({
  leads,
  resumo,
  regioes,
  filtroRegiao,
  filtroStatus,
  integracaoConfigurada,
}: Props) {
  const router = useRouter();
  const [reenviando, setReenviando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const nomeRegiao = new Map(regioes.map((r) => [r.slug, r.nome]));

  function aplicarFiltro(regiao: string, status: string) {
    const q = new URLSearchParams();
    if (regiao) q.set("regiao", regiao);
    if (status) q.set("status", status);
    router.push(`/painel${q.size ? `?${q}` : ""}`);
  }

  async function reenviar(id: string) {
    setReenviando(id);
    setAviso("");
    try {
      const res = await fetch("/api/painel/reenviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) setAviso(dados.erro ?? "Não foi possível reenviar.");
      router.refresh();
    } catch {
      setAviso("Falha de conexão ao reenviar.");
    } finally {
      setReenviando(null);
    }
  }

  async function sair() {
    await fetch("/api/painel/sessao", { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const cartoes = [
    { rotulo: "Total de leads", valor: resumo.total },
    { rotulo: "Hoje", valor: resumo.hoje },
    { rotulo: "Enviados ao sistema", valor: resumo.enviados },
    { rotulo: "Aguardando envio", valor: resumo.pendentes + resumo.falhas },
  ];

  return (
    <main className="min-h-dvh bg-paper">
      {/* Barra superior */}
      <header className="bg-brand-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/imagens/campanha/logo-ea.png"
              alt="Educação Adventista Centro-Oeste"
              width={640}
              height={220}
              className="h-9 w-auto brightness-0 invert"
            />
            <span className="hidden text-sm font-bold uppercase tracking-widest text-white/70 sm:block">
              Painel de leads
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/painel/exportar"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <Download aria-hidden className="size-4" /> CSV
            </a>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <RefreshCw aria-hidden className="size-4" /> Atualizar
            </button>
            <button
              type="button"
              onClick={sair}
              className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-bold text-white/70 transition-colors hover:text-white"
            >
              <LogOut aria-hidden className="size-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cartoes.map((c) => (
            <div
              key={c.rotulo}
              className="rounded-2xl border border-line bg-surface p-5 shadow-card"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {c.rotulo}
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-brand-950">
                {c.valor}
              </p>
            </div>
          ))}
        </div>

        {!integracaoConfigurada ? (
          <p className="mt-6 rounded-xl bg-gold-100 p-4 text-sm text-brand-900">
            A integração com o Sevenbee ainda não foi configurada. Defina{" "}
            <code className="font-bold">SEVENBEE_TOKEN</code> no servidor para os
            leads serem enviados automaticamente como contatos.
          </p>
        ) : null}
        {aviso ? (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
            {aviso}
          </p>
        ) : null}

        {/* Filtros */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTROS.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => aplicarFiltro(filtroRegiao, f.valor)}
                className={cn(
                  "h-9 rounded-full px-4 text-sm font-bold transition-colors",
                  filtroStatus === f.valor
                    ? "bg-brand-700 text-white"
                    : "border border-line bg-surface text-brand-900 hover:bg-brand-50",
                )}
              >
                {f.rotulo}
              </button>
            ))}
          </div>
          <select
            value={filtroRegiao}
            onChange={(e) => aplicarFiltro(e.target.value, filtroStatus)}
            className="h-9 rounded-full border border-line bg-surface px-4 text-sm font-bold text-brand-900"
            aria-label="Filtrar por região"
          >
            <option value="">Todas as regiões</option>
            {regioes.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Região</th>
                <th className="px-4 py-3">Escola / nível</th>
                <th className="px-4 py-3">Status de envio</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Nenhum lead por aqui ainda. Assim que alguém preencher o
                    formulário, ele aparece nesta lista.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 last:border-0">
                    <td
                      className="whitespace-nowrap px-4 py-3 text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {formatarData(l.criado_em)}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-950">
                      {l.nome}
                      {l.email ? (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {l.email}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a
                        href={`https://wa.me/55${l.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        {l.whatsapp}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {nomeRegiao.get(l.estado) ?? l.estado}
                    </td>
                    <td className="max-w-56 px-4 py-3">
                      <span className="block truncate">
                        {l.escola || "Qualquer unidade"}
                      </span>
                      {l.nivel ? (
                        <span className="block text-xs text-muted-foreground">
                          {l.nivel}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <BadgeStatus status={l.webhook_status} />
                      {l.webhook_tentativas > 1 ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {l.webhook_tentativas}x
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {integracaoConfigurada &&
                      l.webhook_status !== "enviado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reenviando === l.id}
                          onClick={() => reenviar(l.id)}
                          className="h-8 rounded-full text-xs font-bold"
                        >
                          {reenviando === l.id ? "Enviando..." : "Reenviar"}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Mostrando {leads.length} lead{leads.length === 1 ? "" : "s"}
          {filtroRegiao || filtroStatus ? " com os filtros aplicados" : ""}.
        </p>
      </div>
    </main>
  );
}
