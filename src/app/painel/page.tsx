import type { Metadata } from "next";
import { listarLeads, resumoLeads } from "@/lib/leads";
import { getConsentimento } from "@/lib/consentimento-registro";
import { getEstados } from "@/lib/rede";
import {
  autenticacaoConfigurada,
  existeAdmin,
  regioesPermitidas,
  usuarioLogado,
} from "@/lib/painel-auth";
import { integracaoConfigurada } from "@/lib/webhook";
import { emailConfigurado } from "@/lib/email";
import LoginPainel from "@/components/painel/LoginPainel";
import PainelLeads from "@/components/painel/PainelLeads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel de leads | Educação Adventista Centro-Oeste",
  robots: { index: false, follow: false },
};

const TODAS_REGIOES = [
  ...getEstados().map((e) => ({ slug: e.slug, nome: e.nome })),
  { slug: "iabc", nome: "IABC (Internato)" },
];

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PainelPage({ searchParams }: Props) {
  const usuario = await usuarioLogado();
  if (!usuario) {
    return (
      <LoginPainel
        configurado={autenticacaoConfigurada()}
        primeiroAcesso={!(await existeAdmin())}
        emailConfigurado={emailConfigurado()}
      />
    );
  }

  const params = await searchParams;
  const permitidas = regioesPermitidas(usuario);
  const regioesVisiveis = permitidas
    ? TODAS_REGIOES.filter((r) => permitidas.includes(r.slug))
    : TODAS_REGIOES;

  const regiaoBruta = typeof params.regiao === "string" ? params.regiao : "";
  // Coordenador só filtra dentro das próprias regiões.
  const regiao =
    regiaoBruta && regioesVisiveis.some((r) => r.slug === regiaoBruta)
      ? regiaoBruta
      : undefined;

  const statusBruto = typeof params.status === "string" ? params.status : "";
  const status =
    statusBruto === "enviado" ||
    statusBruto === "pendente" ||
    statusBruto === "falhou"
      ? statusBruto
      : undefined;

  const [leads, resumo] = await Promise.all([
    listarLeads({ estado: regiao, status, regioesPermitidas: permitidas }),
    resumoLeads(permitidas),
  ]);

  // A prova de consentimento de cada lead na tela, para a coordenação
  // conseguir responder na hora se alguém questionar.
  const consentimentos = Object.fromEntries(
    (
      await Promise.all(
        leads.slice(0, 200).map(async (l) => [l.id, await getConsentimento(l.id)] as const),
      )
    ).filter(([, c]) => c),
  );

  return (
    <PainelLeads
      leads={leads}
      consentimentos={consentimentos}
      resumo={resumo}
      regioes={regioesVisiveis}
      filtroRegiao={regiao ?? ""}
      filtroStatus={status ?? ""}
      integracaoConfigurada={integracaoConfigurada()}
      usuario={{
        nome: usuario.nome,
        papel: usuario.papel,
      }}
    />
  );
}
