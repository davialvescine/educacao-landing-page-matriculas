"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCheck,
  Clock,
  Download,
  Headset,
  Inbox,
  LogOut,
  MessageCircle,
  RefreshCw,
  Send,
  Users,
  Eye,
  Hand,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeadRegistro, ResumoLeads } from "@/lib/leads";
import { useTempoReal } from "@/lib/tempo-real";

interface Props {
  leads: LeadRegistro[];
  /** Prova de consentimento por lead, quando existir. */
  consentimentos: Record<
    string,
    { versao: string; texto: string; aceito_em: string; ip: string; metodo: string; intacto: boolean } | null
  >;
  resumo: ResumoLeads;
  regioes: { slug: string; nome: string }[];
  filtroRegiao: string;
  filtroStatus: string;
  integracaoConfigurada: boolean;
  usuario: { nome: string; papel: "admin" | "coordenador" };
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

function formatarDataLonga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
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

/** Situação do lead dentro do Sevenbee, alimentada pelos webhooks deles. */
function BadgeAtendimento({ status }: { status: string }) {
  if (status === "atendido") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
        <CheckCheck aria-hidden className="size-3" /> Atendido
      </span>
    );
  }
  if (status === "em_atendimento") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
        <Headset aria-hidden className="size-3" /> Em atendimento
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
      <Clock aria-hidden className="size-3" /> Aguardando
    </span>
  );
}

export default function PainelLeads({
  leads: leadsDoServidor,
  consentimentos,
  resumo,
  regioes,
  filtroRegiao,
  filtroStatus,
  integracaoConfigurada,
  usuario,
}: Props) {
  const router = useRouter();
  const [reenviando, setReenviando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [selecionado, setSelecionado] = useState<LeadRegistro | null>(null);
  const nomeRegiao = new Map(regioes.map((r) => [r.slug, r.nome]));

  // A lista renderizada no servidor entra aqui e passa a se manter
  // sozinha. Sem o serviço de tempo real no ar, `ligado` fica falso e a
  // tela volta a depender do botão Atualizar — nada quebra.
  const {
    leads,
    ligado,
    presenca,
    olhares,
    novos,
    olhar,
    largar,
    pegar,
    marcarVisto,
  } = useTempoReal(leadsDoServidor);

  // Enquanto o modal de um lead está aberto, os colegas veem que alguém
  // está nele. É o que evita a mensagem dobrada — antes de qualquer
  // clique em atender.
  useEffect(() => {
    if (!selecionado) {
      largar();
      return;
    }
    olhar(selecionado.id);
    marcarVisto(selecionado.id);
    return () => largar();
  }, [selecionado, olhar, largar, marcarVisto]);

  async function atender(lead: LeadRegistro) {
    const r = await pegar(lead.id);
    if (r.pego) {
      setAviso(`Você está atendendo ${lead.nome}.`);
    } else if (r.erro) {
      setAviso("Não consegui reservar agora. Tente de novo.");
    } else {
      setAviso(`${r.de || "Outra pessoa"} pegou este atendimento primeiro.`);
    }
  }

  // Fecha o modal com Esc e trava o scroll da página enquanto ele está aberto.
  useEffect(() => {
    if (!selecionado) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelecionado(null);
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [selecionado]);

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
      // Reflete o novo status no modal aberto sem esperar o refresh.
      if (dados.status) {
        setSelecionado((atual) =>
          atual && atual.id === id
            ? {
                ...atual,
                webhook_status: dados.status,
                webhook_tentativas: atual.webhook_tentativas + 1,
              }
            : atual,
        );
      }
      router.refresh();
    } catch {
      setAviso("Falha de conexão ao reenviar.");
    } finally {
      setReenviando(null);
    }
  }

  async function reenviarTodos() {
    setReenviando("todos");
    setAviso("");
    try {
      const res = await fetch("/api/painel/reenviar-todos", { method: "POST" });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAviso(dados.erro ?? "Não foi possível reprocessar.");
      } else {
        setAviso(
          `Reprocessamento concluído: ${dados.enviados ?? 0} enviados, ${dados.falhas ?? 0} ainda com falha.`,
        );
      }
      router.refresh();
    } catch {
      setAviso("Falha de conexão ao reprocessar.");
    } finally {
      setReenviando(null);
    }
  }

  async function sair() {
    await signOut().catch(() => {});
    router.refresh();
  }

  const cartoes = [
    { rotulo: "Total de leads", valor: resumo.total },
    { rotulo: "Hoje", valor: resumo.hoje },
    { rotulo: "Enviados ao sistema", valor: resumo.enviados },
    { rotulo: "Aguardando envio", valor: resumo.pendentes + resumo.falhas },
    { rotulo: "Atendidos", valor: resumo.atendidos },
  ];

  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      {/* Barra superior */}
      <header className="bg-brand-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/imagens/logos/logo_colegio.png"
              alt="Educação Adventista Centro-Oeste"
              width={502}
              height={150}
              className="h-10 w-auto"
            />
            <span className="hidden text-sm font-bold uppercase tracking-widest text-white/70 sm:block">
              Painel de leads
            </span>
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80 lg:block">
              {usuario.nome}
              {usuario.papel === "admin" ? " · admin" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Estado da conexão ao vivo. Aparece só quando ligado: selo
                apagado permanente vira ruído para quem nunca teve o
                serviço no ar. */}
            {ligado ? (
              <span
                title={
                  presenca.length > 1
                    ? `Também no painel agora: ${presenca.map((p) => p.nome).join(", ")}`
                    : "Atualizando sozinho"
                }
                className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 text-xs font-bold text-emerald-200"
              >
                <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                Ao vivo
                {presenca.length > 1 ? ` · ${presenca.length}` : ""}
              </span>
            ) : null}
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
            {usuario.papel === "admin" ? (
              <Link
                href="/painel/equipe"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <Users aria-hidden className="size-4" /> Equipe
              </Link>
            ) : null}
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

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
          {integracaoConfigurada && resumo.pendentes + resumo.falhas > 0 ? (
            <Button
              variant="outline"
              disabled={reenviando === "todos"}
              onClick={reenviarTodos}
              className="ml-auto h-9 rounded-full text-sm font-bold"
            >
              <RefreshCw aria-hidden className="size-4" />
              {reenviando === "todos"
                ? "Reprocessando..."
                : `Reenviar todos (${resumo.pendentes + resumo.falhas})`}
            </Button>
          ) : null}
        </div>

        {/* Tabela */}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Região</th>
                <th className="px-4 py-3">Escola / nível</th>
                <th className="px-4 py-3">Status de envio</th>
                <th className="px-4 py-3">Atendimento</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Nenhum lead por aqui ainda. Assim que alguém preencher o
                    formulário, ele aparece nesta lista.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelecionado(l)}
                    className={cn(
                      "cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-brand-50/60",
                      novos.has(l.id) && "animate-pulse bg-gold-100/60",
                    )}
                  >
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
                      {/* Quem está neste lead AGORA. É o aviso que chega
                          antes do dano, e não depois dele. */}
                      {olhares[l.id]?.length ? (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          <Eye aria-hidden className="size-3" />
                          {olhares[l.id].map((p) => p.nome).join(", ")} está aqui
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a
                        href={`https://wa.me/55${l.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        {l.whatsapp}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {nomeRegiao.get(l.estado) ?? l.estado}
                      {l.cidade ? (
                        <span className="block text-xs text-muted-foreground">
                          {l.cidade}
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-56 px-4 py-3">
                      <span className="block truncate">
                        {l.escola || "—"}
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
                    <td className="whitespace-nowrap px-4 py-3">
                      <BadgeAtendimento status={l.atendimento_status} />
                      {l.atendente_nome ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          com {l.atendente_nome}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {/* Reservar o atendimento. Quem decide é o banco:
                          o segundo clique volta com o nome de quem
                          chegou primeiro, e ninguém manda mensagem
                          dobrada para a família. */}
                      {ligado && !l.atendente_id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            atender(l);
                          }}
                          className="mr-2 h-8 rounded-full text-xs font-bold"
                        >
                          <Hand aria-hidden className="size-3" /> Atender
                        </Button>
                      ) : null}
                      {integracaoConfigurada &&
                      l.webhook_status !== "enviado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reenviando === l.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            reenviar(l.id);
                          }}
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

      {/* Rodapé */}
      <footer className="mt-8 bg-brand-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <Image
            src="/imagens/logos/logo_colegio.png"
            alt="Educação Adventista Centro-Oeste"
            width={502}
            height={150}
            className="h-8 w-auto"
          />
          <p className="text-center text-xs text-white/60">
            © {new Date().getFullYear()} Educação Adventista Centro-Oeste.
            Todos os direitos reservados. · Painel interno de matrículas, acesso
            restrito.
          </p>
        </div>
      </footer>

      {/* Modal de detalhes do lead */}
      {selecionado ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelecionado(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes do lead ${selecionado.nome}`}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-surface shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-brand-50/60 px-8 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Lead · {nomeRegiao.get(selecionado.estado) ?? selecionado.estado}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-950">
                  {selecionado.nome}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <BadgeStatus status={selecionado.webhook_status} />
                  <BadgeAtendimento status={selecionado.atendimento_status} />
                  {selecionado.webhook_tentativas > 0 ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {selecionado.webhook_tentativas}{" "}
                      {selecionado.webhook_tentativas === 1
                        ? "tentativa"
                        : "tentativas"}{" "}
                      de envio
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelecionado(null)}
                aria-label="Fechar"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-900"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <dl className="grid gap-x-8 gap-y-5 px-8 py-7 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  WhatsApp
                </dt>
                <dd className="mt-1 text-lg font-bold text-brand-950">
                  {selecionado.whatsapp}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  E-mail
                </dt>
                <dd className="mt-1 break-all font-medium text-brand-950">
                  {selecionado.email || "Não informado"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Cidade da família
                </dt>
                <dd className="mt-1 font-medium text-brand-950">
                  {selecionado.cidade || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Escola de interesse
                </dt>
                <dd className="mt-1 font-medium text-brand-950">
                  {selecionado.escola || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Consentimento
                </dt>
                <dd className="mt-1 text-sm text-brand-950">
                  {(() => {
                    const c = consentimentos[selecionado.id];
                    if (!c)
                      return (
                        <span className="text-muted-foreground">
                          Sem registro. Lead anterior ao registro de aceite.
                        </span>
                      );
                    return (
                      <div className="rounded-xl border border-line bg-paper p-3">
                        <p className="font-medium">
                          Aceito em {formatarData(c.aceito_em)} · versão {c.versao}
                          {c.ip ? ` · ${c.ip}` : ""}
                          {" · "}
                          {c.metodo === "caixa"
                            ? "caixa marcada"
                            : "pelo envio do formulário"}
                        </p>
                        {!c.intacto && (
                          <p className="mt-1 font-bold text-destructive">
                            O texto desta versão mudou depois do aceite: a prova
                            não confere.
                          </p>
                        )}
                        <p className="mt-2 leading-relaxed text-muted-foreground">
                          {c.texto}
                        </p>
                      </div>
                    );
                  })()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Série / nível
                </dt>
                <dd className="mt-1 font-medium text-brand-950">
                  {selecionado.nivel || "Não informado"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Recebido em
                </dt>
                <dd className="mt-1 font-medium text-brand-950" suppressHydrationWarning>
                  {formatarDataLonga(selecionado.criado_em)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Enviado ao sistema em
                </dt>
                <dd className="mt-1 font-medium text-brand-950" suppressHydrationWarning>
                  {selecionado.enviado_em
                    ? formatarDataLonga(selecionado.enviado_em)
                    : "Ainda não enviado"}
                </dd>
              </div>
              {selecionado.utm && Object.keys(selecionado.utm).length ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Origem da campanha
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(selecionado.utm).map(([chave, valor]) => (
                      <span
                        key={chave}
                        className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800"
                      >
                        {chave.replace("utm_", "")}: {valor}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Atendimento no Sevenbee
                </dt>
                <dd className="mt-1 font-medium text-brand-950" suppressHydrationWarning>
                  {selecionado.atendimento_status === "atendido"
                    ? `Atendido em ${formatarDataLonga(selecionado.atendimento_em ?? "")}`
                    : selecionado.atendimento_status === "em_atendimento"
                      ? `Em atendimento desde ${formatarDataLonga(selecionado.atendimento_em ?? "")}`
                      : "Aguardando o primeiro atendimento"}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3 border-t border-line bg-brand-50/40 px-8 py-6">
              <a
                href={`https://wa.me/55${selecionado.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${selecionado.nome.split(" ")[0]}! Recebemos seu interesse na Educação Adventista. Podemos conversar sobre a matrícula?`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle aria-hidden className="size-4" />
                Chamar no WhatsApp
              </a>
              {integracaoConfigurada &&
              selecionado.webhook_status !== "enviado" ? (
                <Button
                  variant="outline"
                  disabled={reenviando === selecionado.id}
                  onClick={() => reenviar(selecionado.id)}
                  className="h-11 rounded-full px-6 text-sm font-bold"
                >
                  <RefreshCw aria-hidden className="size-4" />
                  {reenviando === selecionado.id
                    ? "Enviando..."
                    : "Reenviar ao sistema"}
                </Button>
              ) : null}
              <span className="ml-auto text-[11px] text-muted-foreground">
                ID: {selecionado.id}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
