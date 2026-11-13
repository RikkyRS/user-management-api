import type { LeadStatus } from '@/lib/types';

const labels: Record<LeadStatus, string> = {
  NOVO: 'Novo',
  EM_ATENDIMENTO: 'Em atendimento',
  QUALIFICADO: 'Qualificado',
  PROPOSTA: 'Proposta',
  NEGOCIACAO: 'Negociação',
  CLIENTE: 'Cliente',
  PERDIDO: 'Perdido',
};

/** Ordem do funil (do topo ao fechamento). */
export const ETAPAS: LeadStatus[] = [
  'NOVO',
  'EM_ATENDIMENTO',
  'QUALIFICADO',
  'PROPOSTA',
  'NEGOCIACAO',
  'CLIENTE',
  'PERDIDO',
];

/** Cor de cada etapa (texto, fundo suave e barra). */
export const CORES: Record<LeadStatus, { texto: string; fundo: string; barra: string }> = {
  NOVO: { texto: '#a5b4fc', fundo: 'rgba(129,140,248,0.14)', barra: '#818cf8' },
  EM_ATENDIMENTO: { texto: '#7dd3fc', fundo: 'rgba(56,189,248,0.14)', barra: '#38bdf8' },
  QUALIFICADO: { texto: '#5eead4', fundo: 'rgba(45,212,191,0.14)', barra: '#2dd4bf' },
  PROPOSTA: { texto: '#fcd34d', fundo: 'rgba(251,191,36,0.14)', barra: '#fbbf24' },
  NEGOCIACAO: { texto: '#fdba74', fundo: 'rgba(251,146,60,0.14)', barra: '#fb923c' },
  CLIENTE: { texto: '#86efac', fundo: 'rgba(74,222,128,0.14)', barra: '#4ade80' },
  PERDIDO: { texto: '#fca5a5', fundo: 'rgba(248,113,113,0.12)', barra: '#f87171' },
};

export function statusLabel(status: LeadStatus): string {
  return labels[status] ?? status;
}
