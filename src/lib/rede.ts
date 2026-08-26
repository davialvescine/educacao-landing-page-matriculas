import dados from "@/data/rede.json";
import { slugificar } from "@/lib/site";

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

/** Nome legível de uma região a partir do slug (fallback: o próprio slug). */
export function nomeRegiao(slug: string): string {
  return getEstado(slug)?.nome ?? slug;
}

/** Slug de URL de uma escola (a partir do nome oficial). */
export function slugEscola(escola: Escola): string {
  return slugificar(nomeEscola(escola));
}

/** Localiza uma escola pelo slug dentro de um estado. */
export function getEscola(
  estadoSlug: string,
  escolaSlug: string,
): { estado: Estado; escola: Escola } | undefined {
  const estado = getEstado(estadoSlug);
  if (!estado) return undefined;
  const escola = estado.escolas.find((s) => slugEscola(s) === escolaSlug);
  return escola ? { estado, escola } : undefined;
}

/** Cidade aproximada a partir do nome oficial ("Colégio Adventista de X" → "X"). */
export function cidadeEscola(escola: Escola): string {
  return nomeEscola(escola)
    .replace(/^(Colégio|Escola|Instituto) Adventista (de |do |da |dos |em )?/i, "")
    .trim();
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
