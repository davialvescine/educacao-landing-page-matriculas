"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Acesso } from "@/lib/usuarios";

interface UsuarioLista {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "coordenador";
  regioes: string[];
  ativo: boolean;
  criado_em: string | null;
}

interface Props {
  regioes: { slug: string; nome: string }[];
  acessos: Acesso[];
  usuarioAtual: { id: string; nome: string };
}

const ROTULO_ACAO: Record<string, string> = {
  login: "entrou no painel",
  login_falhou: "tentativa de login",
  login_erro: "erro do servidor na entrada",
  pegou_lead: "pegou o atendimento",
  exportou: "exportou leads",
  reenviou: "reenviou lead",
  criou_usuario: "criou usuário",
  alterou_usuario: "alterou usuário",
  alterou_regiao: "alterou WhatsApp da região",
};

function formatarData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function GestaoEquipe({ regioes, acessos, usuarioAtual }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<UsuarioLista | null>(null);
  const [senhaDe, setSenhaDe] = useState<UsuarioLista | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/painel/usuarios");
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível carregar a equipe.");
        return;
      }
      setUsuarios(dados.usuarios ?? []);
      setErro("");
    } catch {
      setErro("Falha de conexão ao carregar a equipe.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alterar(id: string, dados: Record<string, unknown>) {
    setOcupado(id);
    setAviso("");
    setErro("");
    try {
      const res = await fetch("/api/painel/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...dados }),
      });
      const resposta = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(resposta.erro ?? "Não foi possível atualizar.");
        return false;
      }
      await carregar();
      return true;
    } catch {
      setErro("Falha de conexão.");
      return false;
    } finally {
      setOcupado(null);
    }
  }

  const nomeRegiao = new Map(regioes.map((r) => [r.slug, r.nome]));

  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      {/* Barra superior */}
      <header className="bg-brand-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/imagens/logos/logo_colegio.png"
              alt="Educação Adventista Centro-Oeste"
              width={502}
              height={150}
              className="h-10 w-auto"
            />
            <span className="hidden text-sm font-bold uppercase tracking-widest text-white/70 sm:block">
              Equipe do painel
            </span>
          </div>
          <Link
            href="/painel"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Voltar aos leads
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">
              Quem tem acesso aos leads
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administradores veem todas as regiões e gerenciam a equipe.
              Coordenadores veem apenas as regiões marcadas.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditando(null);
              setFormAberto(true);
            }}
            className="h-11 rounded-full px-6 font-bold"
          >
            <Plus aria-hidden className="size-4" />
            Novo usuário
          </Button>
        </div>

        {erro ? (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
            {erro}
          </p>
        ) : null}
        {aviso ? (
          <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {aviso}
          </p>
        ) : null}

        {/* Lista da equipe */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Pessoa</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Regiões que vê</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 aria-hidden className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum usuário cadastrado ainda.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className={cn(
                      "border-b border-line/60 last:border-0",
                      !u.ativo && "opacity-55",
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-brand-950">{u.nome}</span>
                      {u.id === usuarioAtual.id ? (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                          você
                        </span>
                      ) : null}
                      <span className="block text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {u.papel === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-bold text-white">
                          <ShieldCheck aria-hidden className="size-3" />
                          Administrador
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          Coordenador
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.papel === "admin" ? (
                        <span className="text-muted-foreground">Todas</span>
                      ) : u.regioes.length ? (
                        <span className="flex flex-wrap gap-1.5">
                          {u.regioes.map((r) => (
                            <span
                              key={r}
                              className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-bold text-brand-900"
                            >
                              {nomeRegiao.get(r) ?? r}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-xs text-red-700">Nenhuma</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {u.ativo ? (
                        <span className="text-xs font-bold text-emerald-700">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          Desativado
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={ocupado === u.id}
                          onClick={() => {
                            setEditando(u);
                            setFormAberto(true);
                          }}
                          className="h-8 rounded-full text-xs font-bold"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={ocupado === u.id}
                          onClick={() => setSenhaDe(u)}
                          className="h-8 rounded-full text-xs font-bold"
                          title="Definir nova senha"
                        >
                          <KeyRound aria-hidden className="size-3.5" />
                        </Button>
                        {u.id !== usuarioAtual.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={ocupado === u.id}
                            onClick={async () => {
                              const ok = await alterar(u.id, { ativo: !u.ativo });
                              if (ok) {
                                setAviso(
                                  u.ativo
                                    ? `${u.nome} não acessa mais o painel.`
                                    : `${u.nome} voltou a ter acesso.`,
                                );
                              }
                            }}
                            className={cn(
                              "h-8 rounded-full text-xs font-bold",
                              u.ativo
                                ? "text-red-700 hover:bg-red-50"
                                : "text-emerald-700 hover:bg-emerald-50",
                            )}
                            title={u.ativo ? "Desativar acesso" : "Reativar acesso"}
                          >
                            {u.ativo ? (
                              <UserX aria-hidden className="size-3.5" />
                            ) : (
                              <UserCheck aria-hidden className="size-3.5" />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Registro de acessos */}
        <h2 className="mt-12 text-lg font-extrabold tracking-tight text-brand-950">
          Últimas atividades
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quem entrou, de onde, e o que fez com os dados das famílias.
          Tentativa de entrada que falhou aparece em vermelho: várias
          seguidas no mesmo e-mail é alguém testando senha.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {acessos.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma atividade registrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-line/60">
              {acessos.map((a) => (
                <li
                  key={a.id}
                  className={`flex flex-wrap items-baseline gap-x-2 px-4 py-2.5 text-sm ${
                    a.acao === "login_falhou" ? "bg-destructive/5" : ""
                  }`}
                >
                  <span
                    className="w-28 shrink-0 text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {formatarData(a.criado_em)}
                  </span>
                  <span className="font-bold text-brand-950">
                    {a.usuario_nome || "—"}
                  </span>
                  <span
                    className={
                      a.acao === "login_falhou"
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {ROTULO_ACAO[a.acao] ?? a.acao}
                  </span>
                  {a.detalhe ? (
                    <span className="text-xs text-muted-foreground">
                      · {a.detalhe}
                    </span>
                  ) : null}
                  {a.ip ? (
                    <span className="ml-auto font-mono text-xs text-muted-foreground/70">
                      {a.ip}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {formAberto ? (
        <FormularioUsuario
          regioes={regioes}
          usuario={editando}
          souEu={editando?.id === usuarioAtual.id}
          onFechar={() => setFormAberto(false)}
          onSalvo={async (mensagem) => {
            setFormAberto(false);
            setAviso(mensagem);
            await carregar();
          }}
        />
      ) : null}

      {senhaDe ? (
        <FormularioSenha
          usuario={senhaDe}
          onFechar={() => setSenhaDe(null)}
          onSalvo={(mensagem) => {
            setSenhaDe(null);
            setAviso(mensagem);
          }}
        />
      ) : null}
    </main>
  );
}

/** Modal de criação e edição de usuário. */
function FormularioUsuario({
  regioes,
  usuario,
  souEu,
  onFechar,
  onSalvo,
}: {
  regioes: { slug: string; nome: string }[];
  usuario: UsuarioLista | null;
  souEu: boolean;
  onFechar: () => void;
  onSalvo: (mensagem: string) => void;
}) {
  const novo = !usuario;
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<"admin" | "coordenador">(
    usuario?.papel ?? "coordenador",
  );
  const [selecionadas, setSelecionadas] = useState<string[]>(
    usuario?.regioes ?? [],
  );
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function alternarRegiao(slug: string) {
    setSelecionadas((atual) =>
      atual.includes(slug)
        ? atual.filter((s) => s !== slug)
        : [...atual, slug],
    );
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const corpo: Record<string, unknown> = novo
        ? { nome, email, senha, papel, regioes: selecionadas }
        : { id: usuario!.id, nome, papel, regioes: selecionadas };
      const res = await fetch("/api/painel/usuarios", {
        method: novo ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível salvar.");
        return;
      }
      onSalvo(novo ? `${nome} agora tem acesso ao painel.` : `${nome} atualizado.`);
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-4 backdrop-blur-sm"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={salvar}
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-lg rounded-3xl bg-surface shadow-card-hover"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-8 py-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-brand-950">
              {novo ? "Novo usuário" : `Editar ${usuario!.nome}`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {novo
                ? "A pessoa entra no painel com este e-mail e senha."
                : "Para trocar a senha, use o botão da chave na lista."}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors hover:bg-brand-50"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 px-8 py-6">
          <div className="grid gap-2">
            <Label htmlFor="u-nome">Nome</Label>
            <Input
              id="u-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>

          {novo ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="u-email">E-mail</Label>
                <Input
                  id="u-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="u-senha">Senha inicial</Label>
                <Input
                  id="u-senha"
                  type="text"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo de 8 caracteres. Combine com a pessoa e peça para ela
                  trocar depois.
                </p>
              </div>
            </>
          ) : null}

          <div className="grid gap-2">
            <Label>Papel</Label>
            <div className="flex gap-2">
              {(["coordenador", "admin"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={souEu && p === "coordenador"}
                  onClick={() => setPapel(p)}
                  className={cn(
                    "h-10 flex-1 rounded-full text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    papel === p
                      ? "bg-brand-700 text-white"
                      : "border border-line bg-surface text-brand-900 hover:bg-brand-50",
                  )}
                >
                  {p === "admin" ? "Administrador" : "Coordenador"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {papel === "admin"
                ? "Vê todas as regiões e gerencia a equipe."
                : "Vê apenas os leads das regiões marcadas abaixo."}
            </p>
          </div>

          {papel === "coordenador" ? (
            <div className="grid gap-2">
              <Label>Regiões que pode ver</Label>
              <div className="grid gap-2 rounded-xl border border-line p-4 sm:grid-cols-2">
                {regioes.map((r) => (
                  <label
                    key={r.slug}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selecionadas.includes(r.slug)}
                      onCheckedChange={() => alternarRegiao(r.slug)}
                    />
                    {r.nome}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {erro ? (
            <p className="text-sm font-medium text-destructive">{erro}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-8 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={onFechar}
            className="h-11 rounded-full px-6 font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={enviando}
            className="h-11 rounded-full px-6 font-bold"
          >
            {enviando ? "Salvando..." : novo ? "Criar acesso" : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Modal para o administrador definir uma nova senha. */
function FormularioSenha({
  usuario,
  onFechar,
  onSalvo,
}: {
  usuario: UsuarioLista;
  onFechar: () => void;
  onSalvo: (mensagem: string) => void;
}) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/painel/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuario.id, senha }),
      });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível trocar a senha.");
        return;
      }
      onSalvo(`Senha de ${usuario.nome} atualizada. Combine a nova com a pessoa.`);
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/60 p-4 backdrop-blur-sm"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={salvar}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-card-hover"
      >
        <h2 className="text-xl font-extrabold tracking-tight text-brand-950">
          Nova senha
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Para {usuario.nome}. A senha atual deixa de funcionar na hora.
        </p>
        <div className="mt-6 grid gap-2">
          <Label htmlFor="nova-senha">Senha</Label>
          <Input
            id="nova-senha"
            type="text"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={8}
            required
            autoFocus
          />
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
        </div>
        {erro ? (
          <p className="mt-3 text-sm font-medium text-destructive">{erro}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onFechar}
            className="h-11 rounded-full px-6 font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={enviando || senha.length < 8}
            className="h-11 rounded-full px-6 font-bold"
          >
            {enviando ? "Salvando..." : "Trocar senha"}
          </Button>
        </div>
      </form>
    </div>
  );
}
