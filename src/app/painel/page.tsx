import type { Metadata } from "next";
import { listarLeads, resumoLeads } from "@/lib/leads";
import { getEstados } from "@/lib/rede";
import { painelConfigurado, sessaoValida } from "@/lib/painel-auth";
import { integracaoConfigurada } from "@/lib/webhook";
import LoginPainel from "@/components/painel/LoginPainel";
import PainelLeads from "@/components/painel/PainelLeads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel de leads | Educação Adventista Centro-Oeste",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PainelPage({ searchParams }: Props) {
  if (!(await sessaoValida())) {
    return <LoginPainel configurado={painelConfigurado()} />;
  }

  const params = await searchParams;
  const regiao = typeof params.regiao === "string" ? params.regiao : undefined;
  const statusBruto = typeof params.status === "string" ? params.status : "";
  const status =
    statusBruto === "enviado" ||
    statusBruto === "pendente" ||
    statusBruto === "falhou"
      ? statusBruto
      : undefined;

  const [leads, resumo] = await Promise.all([
    listarLeads({ estado: regiao, status }),
    resumoLeads(),
  ]);

  return (
    <PainelLeads
      leads={leads}
      resumo={resumo}
      regioes={getEstados().map((e) => ({ slug: e.slug, nome: e.nome }))}
      filtroRegiao={regiao ?? ""}
      filtroStatus={status ?? ""}
      integracaoConfigurada={integracaoConfigurada()}
    />
  );
}
