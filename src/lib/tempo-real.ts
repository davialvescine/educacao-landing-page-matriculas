"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
 * tempo real aqui é conforto.
 *
 * O atendimento é conduzido no Sevenbee, não aqui. O que este arquivo
 * mostra é presença: quem está olhando o quê, agora.
 *
 * O endereço vem por parâmetro, do componente de servidor, e não de
 * `NEXT_PUBLIC_*`: variável pública é resolvida no BUILD. Definida só
 * como variável de ambiente no servidor, ela nunca entraria no pacote já
 * compilado, e o tempo real ficaria desligado para sempre — em silêncio.
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
  acao: "insert" | "update" | "delete" | "recarregar";
  lead: Partial<LeadRegistro> & { id: string };
}

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

export function useTempoReal(iniciais: LeadRegistro[], url: string) {
  const router = useRouter();
  const [leads, setLeads] = useState(iniciais);
  const [ligado, setLigado] = useState(false);
  const [presenca, setPresenca] = useState<Presente[]>([]);
  const [olhares, setOlhares] = useState<Record<string, Olhar[]>>({});
  const [novos, setNovos] = useState<Set<string>>(new Set());
  const socket = useRef<Socket | null>(null);
  const recarga = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Recarrega uma vez só, com atraso sorteado, mesmo que o pedido
   *  chegue várias vezes seguidas. */
  const agendarRecarga = useCallback(() => {
    if (recarga.current) return;
    recarga.current = setTimeout(
      () => {
        recarga.current = null;
        router.refresh();
      },
      Math.random() * 4000,
    );
  }, [router]);

  // Nova renderização do servidor (filtro trocado, botão Atualizar):
  // manda na lista. O que veio por socket já está gravado no banco, então
  // a lista do servidor é igual ou mais nova.
  useEffect(() => {
    setLeads(iniciais);
  }, [iniciais]);

  useEffect(() => {
    if (!url) return;

    const s = io(url, {
      withCredentials: true, // sem isto o cookie de sessão não viaja
      transports: ["websocket", "polling"],
    });
    socket.current = s;

    s.on("pronto", () => setLigado(true));
    s.on("disconnect", () => setLigado(false));
    s.on("connect_error", () => setLigado(false));

    // A sessão caiu, expirou ou o acesso foi desativado enquanto a aba
    // estava aberta. Recarregar leva a pessoa à tela de login em vez de
    // deixá-la olhando uma lista que ela não pode mais ver.
    s.on("sessao:encerrada", () => {
      setLigado(false);
      router.refresh();
    });

    s.on("leads:mudou", (aviso: Aviso) => {
      if (!aviso?.lead?.id) return;
      // Carga que não coube no aviso do banco: não dá para remendar com
      // o que chegou, então busca de novo. Ignorar deixaria a tela
      // mostrando um passado com cara de presente.
      if (aviso.acao === "recarregar") {
        agendarRecarga();
        return;
      }
      if (aviso.acao === "delete") {
        setLeads((atual) => atual.filter((l) => l.id !== aviso.lead.id));
        return;
      }
      setLeads((atual) => aplicarMudanca(atual, aviso.lead));
      if (aviso.acao === "insert") {
        setNovos((n) => new Set(n).add(aviso.lead.id));
      }
    });

    // O lead mudou de região e deixou de ser meu: sai da tela agora, e
    // não na próxima vez que alguém apertar Atualizar.
    s.on("leads:sumiu", ({ id }: { id: string }) => {
      setLeads((atual) => atual.filter((l) => l.id !== id));
    });

    // A escuta do banco caiu e voltou. O que aconteceu no intervalo não
    // volta — o Postgres não guarda notificação — então a lista inteira
    // é buscada de novo.
    //
    // Com atraso sorteado: o aviso chega a todas as abas no mesmo
    // instante, e vinte recarregando juntas viram uma rajada de
    // consultas em cima do banco que acabou de voltar. Espalhar em
    // alguns segundos custa nada a quem olha e evita derrubar de novo o
    // que estava se recuperando.
    s.on("recarregar", () => agendarRecarga());

    // Reconexão da PRÓPRIA aba: o serviço pode ter reiniciado, ou a
    // rede caiu. De um jeito ou de outro, o que aconteceu enquanto ela
    // esteve fora não chega — então ela também precisa buscar de novo.
    s.io.on("reconnect", () => agendarRecarga());

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
      if (recarga.current) clearTimeout(recarga.current);
    };
  }, [url, router, agendarRecarga]);

  /** Avisa que estou neste lead. É o que aparece para os outros antes de
   *  qualquer clique — e é o que de fato evita duas mensagens à família. */
  const olhar = useCallback((leadId: string) => {
    socket.current?.emit("lead:olhando", leadId);
  }, []);

  const largar = useCallback(() => {
    socket.current?.emit("lead:largou");
  }, []);

  const marcarVisto = useCallback((leadId: string) => {
    setNovos((n) => {
      if (!n.has(leadId)) return n;
      const novo = new Set(n);
      novo.delete(leadId);
      return novo;
    });
  }, []);

  return { leads, ligado, presenca, olhares, novos, olhar, largar, marcarVisto };
}
