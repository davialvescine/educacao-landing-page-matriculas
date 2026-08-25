import dados from "@/data/rede.json";

export interface Escola {
  nome: string;
  nome_oficial?: string;
  endereco: string | null;
  foto: string | null;
  foto_propria?: boolean;
  foto_reaproveitada_de?: string | null;
  telefone?: string;
  whatsapp_escola?: string;
  site?: string;
  obs?: string;
  pendencias?: string[];
}

export interface Estado {
  slug: string;
  nome: string;
  uf: string;
  associacao: string;
  whatsapp: {
    numero: string | null;
    link: string | null;
    confirmar_numero: boolean;
  };
  sem_pagina_no_site?: boolean;
  total_escolas: number;
  escolas: Escola[];
}

export interface Rede {
  slogan: string;
  titulo_campanha: string;
  estatisticas: { valor: string; rotulo: string }[];
  diferenciais: string[];
  estados: Estado[];
  iabc: {
    nome: string;
    tipo: string;
    site: string;
    endereco?: string;
    telefone?: string;
  };
}

const rede = dados as unknown as Rede;

export function getRede(): Rede {
  return rede;
}

export function getEstados(): Estado[] {
  return rede.estados;
}

export function getEstado(slug: string): Estado | undefined {
  return rede.estados.find((e) => e.slug === slug);
}

export function nomeEscola(escola: Escola): string {
  return escola.nome_oficial ?? escola.nome;
}

/** Dados enxutos para o formulário de leads (client component). */
export function getFormEstados() {
  return rede.estados.map((e) => ({
    slug: e.slug,
    nome: e.nome,
    uf: e.uf,
    escolas: e.escolas.map((s) => nomeEscola(s)),
  }));
}

export type FormEstado = ReturnType<typeof getFormEstados>[number];
