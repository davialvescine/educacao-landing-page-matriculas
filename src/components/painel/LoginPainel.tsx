"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPainel({ configurado }: { configurado: boolean }) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/painel/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível entrar.");
        return;
      }
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-brand-950 px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-card"
      >
        <Image
          src="/imagens/campanha/logo-ea.png"
          alt="Educação Adventista Centro-Oeste"
          width={640}
          height={220}
          className="mx-auto h-14 w-auto brightness-0"
        />
        <h1 className="mt-6 text-center text-xl font-extrabold tracking-tight text-brand-950">
          Painel de leads
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Acesso restrito à equipe de matrículas.
        </p>
        {configurado ? (
          <>
            <div className="mt-6 grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoFocus
                required
              />
            </div>
            {erro ? (
              <p className="mt-3 text-sm font-medium text-destructive">{erro}</p>
            ) : null}
            <Button
              type="submit"
              disabled={enviando || !senha}
              className="mt-5 h-11 w-full rounded-full font-bold"
            >
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
          </>
        ) : (
          <p className="mt-6 rounded-xl bg-gold-100 p-4 text-sm text-brand-900">
            O painel ainda não foi configurado. Defina a variável{" "}
            <code className="font-bold">PAINEL_SENHA</code> no servidor para
            liberar o acesso.
          </p>
        )}
      </form>
    </main>
  );
}
