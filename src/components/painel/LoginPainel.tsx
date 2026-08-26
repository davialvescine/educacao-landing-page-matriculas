"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  configurado: boolean;
  /** Nenhum admin cadastrado ainda: mostra o formulário de primeiro acesso. */
  primeiroAcesso: boolean;
  /** Com SMTP no servidor, aparece o "esqueci minha senha". */
  emailConfigurado: boolean;
}

export default function LoginPainel({
  configurado,
  primeiroAcesso,
  emailConfigurado,
}: Props) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function pedirNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/painel/nova-senha",
      });
      // Resposta sempre igual: não revela se o e-mail existe.
      setEnviado(true);
    } catch {
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      if (primeiroAcesso) {
        const res = await fetch("/api/painel/primeiro-acesso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha }),
        });
        const dados = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErro(dados.erro ?? "Não foi possível criar o acesso.");
          return;
        }
        // Conta criada: entra em seguida com as mesmas credenciais.
        const { error } = await signIn.email({ email, password: senha });
        if (error) {
          setErro("Conta criada. Entre com seu e-mail e senha.");
          return;
        }
      } else {
        const { error } = await signIn.email({ email, password: senha });
        if (error) {
          // Mensagem genérica: não revela se o e-mail existe.
          setErro(
            error.message?.includes("desativado")
              ? error.message
              : "E-mail ou senha incorretos.",
          );
          return;
        }
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
        onSubmit={enviar}
        className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-card"
      >
        <Image
          src="/imagens/logos/logo_colegio.png"
          alt="Educação Adventista Centro-Oeste"
          width={502}
          height={150}
          className="mx-auto h-14 w-auto brightness-0"
        />
        <h1 className="mt-6 text-center text-xl font-extrabold tracking-tight text-brand-950">
          {recuperando
            ? "Recuperar acesso"
            : primeiroAcesso
              ? "Criar acesso de administrador"
              : "Painel de leads"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {recuperando
            ? "Enviamos um link para você cadastrar uma nova senha."
            : primeiroAcesso
              ? "Este é o primeiro acesso: crie a conta que vai gerenciar a equipe."
              : "Entre com seu e-mail e senha."}
        </p>

        {configurado && recuperando ? (
          enviado ? (
            <div className="mt-6 text-center">
              <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                Se este e-mail estiver cadastrado, o link para criar uma nova
                senha chega em instantes. Confira também o spam.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRecuperando(false);
                  setEnviado(false);
                }}
                className="mt-4 text-sm font-bold text-brand-700 hover:underline"
              >
                Voltar para a entrada
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-2">
                <Label htmlFor="email-recuperar">
                  Seu e-mail cadastrado
                </Label>
                <Input
                  id="email-recuperar"
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  autoComplete="username"
                  required
                  autoFocus
                />
              </div>
              {erro ? (
                <p className="mt-3 text-sm font-medium text-destructive">{erro}</p>
              ) : null}
              <Button
                type="button"
                onClick={pedirNovaSenha}
                disabled={enviando || !email}
                className="mt-5 h-11 w-full rounded-full font-bold"
              >
                {enviando ? "Enviando..." : "Enviar link por e-mail"}
              </Button>
              <button
                type="button"
                onClick={() => setRecuperando(false)}
                className="mt-4 block w-full text-center text-sm font-bold text-brand-700 hover:underline"
              >
                Voltar
              </button>
            </>
          )
        ) : configurado ? (
          <>
            {primeiroAcesso ? (
              <div className="mt-6 grid gap-2">
                <Label htmlFor="nome">Seu nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  required
                  autoFocus
                />
              </div>
            ) : null}

            <div className={primeiroAcesso ? "mt-4 grid gap-2" : "mt-6 grid gap-2"}>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                autoFocus={!primeiroAcesso}
              />
            </div>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={primeiroAcesso ? "new-password" : "current-password"}
                required
              />
              {primeiroAcesso ? (
                <p className="text-xs text-muted-foreground">
                  Mínimo de 8 caracteres.
                </p>
              ) : null}
            </div>

            {erro ? (
              <p className="mt-3 text-sm font-medium text-destructive">{erro}</p>
            ) : null}

            <Button
              type="submit"
              disabled={enviando || !email || !senha || (primeiroAcesso && !nome)}
              className="mt-5 h-11 w-full rounded-full font-bold"
            >
              {enviando
                ? "Aguarde..."
                : primeiroAcesso
                  ? "Criar acesso"
                  : "Entrar"}
            </Button>

            {!primeiroAcesso ? (
              emailConfigurado ? (
                <button
                  type="button"
                  onClick={() => {
                    setRecuperando(true);
                    setErro("");
                  }}
                  className="mt-4 block w-full text-center text-sm font-bold text-brand-700 hover:underline"
                >
                  Esqueci minha senha
                </button>
              ) : (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Esqueceu a senha? Peça ao administrador do painel para
                  cadastrar uma nova.
                </p>
              )
            ) : null}
          </>
        ) : (
          <p className="mt-6 rounded-xl bg-gold-100 p-4 text-sm text-brand-900">
            O painel ainda não foi configurado. Defina a variável{" "}
            <code className="font-bold">SESSAO_SEGREDO</code> no servidor para
            liberar o acesso.
          </p>
        )}
      </form>
    </main>
  );
}
