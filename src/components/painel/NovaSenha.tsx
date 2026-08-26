"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Tela do link de redefinição: cadastra a nova senha e volta ao painel. */
export default function NovaSenha({
  token,
  erroLink,
}: {
  token: string;
  erroLink: boolean;
}) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== confirmacao) {
      setErro("As duas senhas precisam ser iguais.");
      return;
    }
    setEnviando(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: senha,
        token,
      });
      if (error) {
        setErro(
          "Este link não vale mais. Peça um novo na tela de entrada do painel.",
        );
        return;
      }
      setPronto(true);
      setTimeout(() => router.push("/painel"), 2200);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-card">
        <Image
          src="/imagens/logos/logo_colegio.png"
          alt="Educação Adventista Centro-Oeste"
          width={502}
          height={150}
          className="mx-auto h-14 w-auto brightness-0"
        />

        {erroLink ? (
          <>
            <h1 className="mt-6 text-center text-xl font-extrabold tracking-tight text-brand-950">
              Link inválido
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Este link expirou ou já foi usado. Peça um novo na tela de
              entrada do painel.
            </p>
            <Link
              href="/painel"
              className="mt-6 flex h-11 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
            >
              Ir para a entrada
            </Link>
          </>
        ) : pronto ? (
          <>
            <CheckCircle2
              aria-hidden
              className="mx-auto mt-6 size-10 text-emerald-600"
            />
            <h1 className="mt-4 text-center text-xl font-extrabold tracking-tight text-brand-950">
              Senha atualizada
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Estamos levando você para o painel...
            </p>
          </>
        ) : (
          <form onSubmit={salvar}>
            <h1 className="mt-6 text-center text-xl font-extrabold tracking-tight text-brand-950">
              Cadastrar nova senha
            </h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Escolha uma senha de pelo menos 8 caracteres.
            </p>
            <div className="mt-6 grid gap-2">
              <Label htmlFor="nova">Nova senha</Label>
              <Input
                id="nova"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                autoFocus
              />
            </div>
            <div className="mt-4 grid gap-2">
              <Label htmlFor="confirma">Repita a senha</Label>
              <Input
                id="confirma"
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {erro ? (
              <p className="mt-3 text-sm font-medium text-destructive">{erro}</p>
            ) : null}
            <Button
              type="submit"
              disabled={enviando || senha.length < 8}
              className="mt-5 h-11 w-full rounded-full font-bold"
            >
              {enviando ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
