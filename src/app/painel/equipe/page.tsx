import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirPapel } from "@/lib/painel-auth";
import { listarAcessos } from "@/lib/usuarios";
import { getEstados } from "@/lib/rede";
import GestaoEquipe from "@/components/painel/GestaoEquipe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Equipe | Educação Adventista Centro-Oeste",
  robots: { index: false, follow: false },
};

const REGIOES = [
  ...getEstados().map((e) => ({ slug: e.slug, nome: e.nome })),
  { slug: "iabc", nome: "IABC (Internato)" },
];

export default async function EquipePage() {
  const admin = await exigirPapel("admin");
  if (!admin) redirect("/painel");

  const acessos = await listarAcessos(30);

  return (
    <GestaoEquipe
      regioes={REGIOES}
      acessos={acessos}
      usuarioAtual={{ id: admin.id, nome: admin.nome }}
    />
  );
}
