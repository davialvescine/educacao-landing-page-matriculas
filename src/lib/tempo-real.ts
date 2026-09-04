"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { LeadRegistro } from "@/lib/leads";

/**
 * Liga o painel ao serviço de tempo real.
 *
 * O servidor renderiza a lista uma vez; daqui em diante ela se mantém
 * sozinha. Cada evento traz a linha inteira que mudou, e a lista é
 * remendada no lugar — não há nova consulta ao banco a cada aviso. Isso
 * não é economia à toa: refazer a busca perderia rolagem, foco e a linha
 * que a pessoa estava lendo.
 *
 * Se o serviço estiver fora do ar, `ligado` fica falso e o painel volta a
 * ser o que era: lista do servidor mais o botão Atualizar. Nada quebra —
 * tempo real aqui é conforto, e a garantia contra atendimento duplicado
 * está no banco, não neste arquivo.
 */

export interface Olhar {
  id: string;
  nome: string;
}

export interface Presente {
  id: string;
  nome: string;
}

interface Aviso {
  acao: "insert" | "update" | "recarregar";
  lead: Partial<LeadRegistro> & { id: string };
}

const URL_TEMPO_REAL = process.env.NEXT_PUBLIC_TEMPO_REAL_URL ?? "";

/** Troca a linha de mesmo id e preserva a referência das outras, para o
 *  React não redesenhar a tabela inteira por causa de um lead. */
function aplicarMudanca(
  lista: LeadRegistro[],
  mudou: Partial<LeadRegistro> & { id: string },
): LeadRegistro[] {
  let achou = false;
  const nova = lista.map((l) => {
    if (l.id !== mudou.id) return l;
    achou = true;
    return { ...l, ...mudou };
  });
  if (achou) return nova;
  // Lead que ainda não estava na tela: entra no topo, que é onde a
  // ordenação por data o colocaria.
  return [mudou as LeadRegistro, ...lista];
}

export function useTempoReal(iniciais: LeadRegistro[]) {
  const [leads, setLeads] = useState(iniciais);
  const [ligado, setLigado] = useState(false);
  const [presenca, setPresenca] = useState<Presente[]>([]);
  const [olhares, setOlhares] = useState<Record<string, Olhar[]>>({});
  const [novos, setNovos] = useState<Set<string>>(new Set());
  const socket = useRef<Socket | null>(null);

  // Nova renderização do servidor (filtro trocado, botão Atualizar):
  // manda na lista. O que veio por socket já está gravado no banco, então
  // a lista do servidor é igual ou mais nova.
  useEffect(() => {
    setLeads(iniciais);
  }, [iniciais]);

  useEffect(() => {
    if (!URL_TEMPO_REAL) return;

    const s = io(URL_TEMPO_REAL, {
      withCredentials: true, // sem isto o cookie de sessão não viaja
      transports: ["websocket", "polling"],
    });
    socket.current = s;

    s.on("pronto", () => setLigado(true));
    s.on("disconnect", () => setLigado(false));
    s.on("connect_error", () => setLigado(false));

    s.on("leads:mudou", (aviso: Aviso) => {
      if (!aviso?.lead?.id) return;
      if (aviso.acao === "recarregar") return; // carga grande: espera o refresh
      setLeads((atual) => aplicarMudanca(atual, aviso.lead));
      if (aviso.acao === "insert") {
        setNovos((n) => new Set(n).add(aviso.lead.id));
      }
    });

    s.on("presenca", (pessoas: Presente[]) => setPresenca(pessoas ?? []));

    s.on("lead:olhares", ({ leadId, pessoas }: { leadId: string; pessoas: Olhar[] }) => {
      setOlhares((atual) => {
        const novo = { ...atual };
        if (pessoas?.length) novo[leadId] = pessoas;
        else delete novo[leadId];
        return novo;
      });
    });

    return () => {
      s.close();
      socket.current = null;
    };
  }, []);

  /** Avisa que estou neste lead. É o que aparece para os outros antes de
   *  qualquer clique — e é o que de fato evita duas mensagens à família. */
  const olhar = useCallback((leadId: string) => {
    socket.current?.emit("lead:olhando", leadId);
  }, []);

  const largar = useCallback(() => {
    socket.current?.emit("lead:largou");
  }, []);

  /** Pede o atendimento. Quem decide é o banco: o segundo pedido volta
   *  com `pego: false` e o nome de quem chegou primeiro. */
  const pegar = useCallback(
    (leadId: string) =>
      new Promise<{ pego: boolean; de?: string; erro?: boolean }>((ok) => {
        const s = socket.current;
        if (!s?.connected) return ok({ pego: false, erro: true });
        s.emit("lead:pegar", leadId, ok);
      }),
    [],
  );

  const marcarVisto = useCallback((leadId: string) => {
    setNovos((n) => {
      if (!n.has(leadId)) return n;
      const novo = new Set(n);
      novo.delete(leadId);
      return novo;
    });
  }, []);

  const outros = useMemo(
    () => presenca.length,
    [presenca],
  );

  return { leads, ligado, presenca, outros, olhares, novos, olhar, largar, pegar, marcarVisto };
}
