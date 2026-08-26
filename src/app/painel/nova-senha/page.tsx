import type { Metadata } from "next";
import NovaSenha from "@/components/painel/NovaSenha";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nova senha | Educação Adventista Centro-Oeste",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NovaSenhaPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const erro = typeof params.error === "string" ? params.error : "";
  return <NovaSenha token={token} erroLink={Boolean(erro) || !token} />;
}
