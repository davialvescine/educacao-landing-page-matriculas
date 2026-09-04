import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { gerarRelatorio, mesesComDados } from "@/lib/relatorio";
import { nomeRegiaoParaFamilia } from "@/lib/rede";
import { regioesPermitidas, usuarioLogado } from "@/lib/painel-auth";
import { registrarAcesso } from "@/lib/usuarios";
import Relatorio from "@/components/painel/Relatorio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Relatório mensal",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Número de um parâmetro de URL, ou nulo quando não der para confiar. */
function inteiro(v: unknown, min: number, max: number): number | null {
  const n = Number(typeof v === "string" ? v : NaN);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export default async function RelatorioPage({ searchParams }: Props) {
  const usuario = await usuarioLogado();
  if (!usuario) redirect("/painel");

  const params = await searchParams;
  const permitidas = regioesPermitidas(usuario);
  const meses = await mesesComDados(permitidas);

  const hoje = new Date();
  const ano = inteiro(params.ano, 2020, 2100) ?? meses[0]?.ano ?? hoje.getFullYear();
  const mes = inteiro(params.mes, 1, 12) ?? meses[0]?.mes ?? hoje.getMonth() + 1;

  const dados = await gerarRelatorio({
    ano,
    mes,
    regioesPermitidas: permitidas,
    nomeRegiao: nomeRegiaoParaFamilia,
  });

  // Ver o relatório é ver dado de família em bloco. Entra na trilha pelo
  // mesmo motivo que a exportação entra.
  await registrarAcesso("viu_relatorio", {
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    detalhe: `${mes}/${ano} · ${dados?.total ?? 0} leads`,
  });

  return (
    <Relatorio
      dados={dados}
      meses={meses.length ? meses : [{ ano, mes, rotulo: `${mes}/${ano}` }]}
      selecionado={{ ano, mes }}
    />
  );
}
