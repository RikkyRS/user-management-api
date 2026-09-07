export type LeadStatus =
  | 'NOVO'
  | 'EM_ATENDIMENTO'
  | 'QUALIFICADO'
  | 'PROPOSTA'
  | 'NEGOCIACAO'
  | 'CLIENTE'
  | 'PERDIDO';

export type Me = {
  id: string;
  nome: string;
  email: string;
  role: string;
  empresaId: string | null;
  isCrmOwner: boolean;
};

export type Lead = {
  id: string;
  empresaId: string;
  nome: string;
  telefone: string;
  email: string | null;
  origem: string | null;
  interesse: string | null;
  status: LeadStatus;
  responsavelUsuarioId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PageResult<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export type EmpresaOption = {
  id: string;
  nome: string;
  role: string;
};
