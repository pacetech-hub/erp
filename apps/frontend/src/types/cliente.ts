export type StatusCliente = 'ativo' | 'inativo';

export interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
  inscricaoEstadual: string | null;
  endereco: string;
  cidade: string;
  uf: string;
  status: StatusCliente;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
}

export interface ClienteFormValues {
  nome: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco: string;
  cidade: string;
  uf: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListClientesParams {
  page?: number;
  limit?: number;
  busca?: string;
  status?: StatusCliente;
}
