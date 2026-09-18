import { http } from '../lib/http';
import type {
  Cliente,
  ClienteFormValues,
  ListClientesParams,
  PaginatedResult,
} from '../types/cliente';

export async function listClientes(params: ListClientesParams) {
  const { data } = await http.get<PaginatedResult<Cliente>>('/clientes', { params });
  return data;
}

export async function getCliente(id: string) {
  const { data } = await http.get<Cliente>(`/clientes/${id}`);
  return data;
}

export async function createCliente(values: ClienteFormValues) {
  const { data } = await http.post<Cliente>('/clientes', values);
  return data;
}

export async function updateCliente(id: string, values: ClienteFormValues) {
  const { data } = await http.patch<Cliente>(`/clientes/${id}`, values);
  return data;
}

export async function ativarCliente(id: string) {
  const { data } = await http.patch<Cliente>(`/clientes/${id}/ativar`);
  return data;
}

export async function inativarCliente(id: string) {
  const { data } = await http.patch<Cliente>(`/clientes/${id}/inativar`);
  return data;
}
