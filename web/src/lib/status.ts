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

export function statusLabel(status: LeadStatus): string {
  return labels[status] ?? status;
}
