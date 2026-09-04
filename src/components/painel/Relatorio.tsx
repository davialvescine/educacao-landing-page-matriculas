"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Download, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Linha, Relatorio as Dados } from "@/lib/relatorio";

interface Props {
  dados: Dados | null;
  meses: { ano: number; mes: number; rotulo: string }[];
  selecionado: { ano: number; mes: number };
}

function formatarDia(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Barra proporcional ao maior valor da lista, e não ao total.
 * Proporção sobre o total achata tudo quando há muitas linhas: com
 * quinze escolas, a maior fica com 12% da largura e o gráfico não mostra
 * nada. O que interessa aqui é a comparação entre elas.
 */
function Ranking({
  titulo,
  linhas,
  vazio,
}: {
  titulo: string;
  linhas: Linha[];
  vazio: string;
}) {
  const maior = Math.max(1, ...linhas.map((l) => l.total));
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
        {titulo}
      </h2>
      {linhas.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {linhas.map((l) => (
            <li key={l.rotulo}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-semibold text-brand-950">
                  {l.rotulo}
                </span>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-brand-950">
                  {l.total}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500"
                  style={{ width: `${(l.total / maior) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Relatorio({ dados, meses, selecionado }: Props) {
  const [aberta, setAberta] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-brand-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/painel"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft aria-hidden className="size-4" /> Leads
            </Link>
            <span className="text-sm font-extrabold uppercase tracking-widest text-gold-300">
              Relatório mensal
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Seleção por navegação, e não por JavaScript: assim o mês
                fica no endereço e pode ser guardado ou mandado por
                mensagem para outra pessoa. */}
            <div className="relative">
              <select
                aria-label="Mês do relatório"
                defaultValue={`${selecionado.ano}-${selecionado.mes}`}
                onChange={(e) => {
                  const [ano, mes] = e.target.value.split("-");
                  window.location.href = `/painel/relatorio?ano=${ano}&mes=${mes}`;
                }}
                className="h-9 appearance-none rounded-full border border-white/25 bg-transparent pl-4 pr-9 text-sm font-bold text-white [&>option]:text-brand-950"
              >
                {meses.map((m) => (
                  <option key={`${m.ano}-${m.mes}`} value={`${m.ano}-${m.mes}`}>
                    {m.rotulo}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/70"
              />
            </div>
            <a
              href={`/api/painel/exportar?ano=${selecionado.ano}&mes=${selecionado.mes}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <Download aria-hidden className="size-4" /> CSV do mês
            </a>
          </div>
        </div>
      </header>

      {!dados ? (
        <p className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
          Nenhum lead neste mês.
        </p>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-8">
          {/* Números do mês */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 p-5 shadow-cta">
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-950/70">
                Leads em {dados.rotulo}
              </p>
              <p className="mt-1 text-4xl font-extrabold tracking-tighter text-brand-950">
                {dados.total}
              </p>
              {/* Número sem comparação vira enfeite: 78 é bom ou ruim
                  depende de terem sido 40 ou 130 no mês passado. */}
              {dados.variacao !== null ? (
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-brand-950/80">
                  {dados.variacao >= 0 ? (
                    <TrendingUp aria-hidden className="size-4" />
                  ) : (
                    <TrendingDown aria-hidden className="size-4" />
                  )}
                  {dados.variacao > 0 ? "+" : ""}
                  {dados.variacao}% sobre o mês anterior
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold text-brand-950/70">
                  Sem mês anterior para comparar
                </p>
              )}
            </div>

            {[
              ["Atendidos", dados.atendidos, "concluídos no Sevenbee"],
              ["Em atendimento", dados.emAtendimento, "conversa em andamento"],
              ["Aguardando", dados.aguardando, "ainda sem contato"],
            ].map(([rotulo, valor, nota]) => (
              <div
                key={String(rotulo)}
                className="rounded-2xl border border-line bg-surface p-5 shadow-card"
              >
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  {rotulo}
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-tighter text-brand-950">
                  {valor}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{nota}</p>
              </div>
            ))}
          </div>

          {/* Ritmo de chegada */}
          <section className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
              Chegada dia a dia
            </h2>
            <div className="mt-4 flex h-24 items-end gap-[3px]">
              {dados.porDia.map((d) => {
                const maior = Math.max(1, ...dados.porDia.map((x) => x.total));
                return (
                  <div
                    key={d.dia}
                    title={`Dia ${d.dia}: ${d.total} lead${d.total === 1 ? "" : "s"}`}
                    className="flex-1 rounded-t bg-brand-700/80 transition-colors hover:bg-brand-700"
                    style={{ height: `${Math.max(2, (d.total / maior) * 100)}%` }}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>dia 1</span>
              <span>dia {dados.porDia.length}</span>
            </div>
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Ranking
              titulo="Escolas mais procuradas"
              linhas={dados.porEscola}
              vazio="Ninguém informou escola neste mês."
            />
            <Ranking
              titulo="Séries pretendidas"
              linhas={dados.porNivel}
              vazio="Ninguém informou série neste mês."
            />
            <Ranking
              titulo="De onde vieram"
              linhas={dados.porCampanha}
              vazio="Sem origem registrada."
            />
            <Ranking
              titulo="Por região"
              linhas={dados.porRegiao}
              vazio="Sem leads."
            />
          </div>

          {/* O corpo do relatório: todos os leads, separados por região */}
          <h2 className="mt-10 text-lg font-extrabold tracking-tight text-brand-950">
            Todos os leads de {dados.rotulo}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Separados por região. Clique para abrir a lista de cada uma.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {dados.leadsPorRegiao.map((g) => {
              const abertaAgora = aberta === g.regiao;
              return (
                <section
                  key={g.regiao}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
                >
                  <button
                    type="button"
                    onClick={() => setAberta(abertaAgora ? null : g.regiao)}
                    aria-expanded={abertaAgora}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-50/60"
                  >
                    <span className="font-extrabold text-brand-950">{g.regiao}</span>
                    <span className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        <strong className="text-brand-950">{g.total}</strong> leads
                      </span>
                      <span>{g.atendidos} atendidos</span>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "size-4 transition-transform",
                          abertaAgora && "rotate-180",
                        )}
                      />
                    </span>
                  </button>

                  {abertaAgora ? (
                    <div className="overflow-x-auto border-t border-line">
                      <table className="w-full min-w-160 text-left text-sm">
                        <thead className="bg-brand-50/60 text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-5 py-2 font-bold">Data</th>
                            <th className="px-5 py-2 font-bold">Nome</th>
                            <th className="px-5 py-2 font-bold">WhatsApp</th>
                            <th className="px-5 py-2 font-bold">Escola / série</th>
                            <th className="px-5 py-2 font-bold">Atendimento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.leads.map((l) => (
                            <tr key={l.id} className="border-t border-line/60">
                              <td
                                className="whitespace-nowrap px-5 py-2.5 text-muted-foreground"
                                suppressHydrationWarning
                              >
                                {formatarDia(l.criado_em)}
                              </td>
                              <td className="px-5 py-2.5 font-bold text-brand-950">
                                {l.nome}
                                {l.email ? (
                                  <span className="block text-xs font-normal text-muted-foreground">
                                    {l.email}
                                  </span>
                                ) : null}
                              </td>
                              <td className="whitespace-nowrap px-5 py-2.5">
                                <a
                                  href={`https://wa.me/55${l.whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-emerald-700 hover:underline"
                                >
                                  {l.whatsapp}
                                </a>
                              </td>
                              <td className="px-5 py-2.5">
                                {l.escola || "—"}
                                {l.nivel ? (
                                  <span className="block text-xs text-muted-foreground">
                                    {l.nivel}
                                  </span>
                                ) : null}
                              </td>
                              <td className="whitespace-nowrap px-5 py-2.5 text-muted-foreground">
                                {l.atendimento_status === "atendido"
                                  ? "Atendido"
                                  : l.atendimento_status === "em_atendimento"
                                    ? "Em atendimento"
                                    : "Aguardando"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}
