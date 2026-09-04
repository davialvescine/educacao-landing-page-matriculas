import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirPapel } from "@/lib/painel-auth";
import { listarAcessos } from "@/lib/usuarios";
import { getEstados } from "@/lib/rede";
import GestaoEquipe from "@/components/painel/GestaoEquipe";
import WhatsappRegioes, {
  type RegiaoWhatsapp,
} from "@/components/painel/WhatsappRegioes";
import {
  getHistoricoWhatsapp,
  getWhatsappSobrescritos,
} from "@/lib/regioes";

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

  const [acessos, sobrescritos, historico] = await Promise.all([
    listarAcessos(30),
    getWhatsappSobrescritos(),
    getHistoricoWhatsapp(),
  ]);

  // A tela edita as 6 associações internas, não as 5 regiões do site: cada
  // associação atende com o próprio número, inclusive dentro do Mato Grosso.
  const whatsapps: RegiaoWhatsapp[] = getEstados().map((e) => ({
    slug: e.slug,
    nome: e.nome,
    associacao: e.associacao,
    numero: sobrescritos[e.slug]?.numero ?? e.whatsapp.numero ?? "",
    editado: Boolean(sobrescritos[e.slug]),
    atualizadoPor: historico[e.slug]?.atualizado_por,
  }));

  return (
    <div className="flex flex-col gap-8">
      <GestaoEquipe
        regioes={REGIOES}
        acessos={acessos}
        usuarioAtual={{ id: admin.id, nome: admin.nome }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 pb-16">
        <WhatsappRegioes regioes={whatsapps} />
      </div>
    </div>
  );
}
