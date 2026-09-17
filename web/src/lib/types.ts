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

export type MensagemDirecao = 'INBOUND' | 'OUTBOUND';

export type Mensagem = {
  id: string;
  empresaId: string;
  leadId: string;
  direcao: MensagemDirecao;
  texto: string;
  waMessageId: string | null;
  createdAt: string;
};

export type ConversaPreview = {
  leadId: string;
  nome: string;
  telefone: string;
  status: LeadStatus;
  lastMessage: {
    id: string;
    texto: string;
    direcao: MensagemDirecao;
    createdAt: string;
  };
};

export type EmpresaOption = {
  id: string;
  nome: string;
  role: string;
};
