import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientes } from '../../api/clientes';
import { StatusBadge } from '../../components/StatusBadge';
import type { StatusCliente } from '../../types/cliente';
import './clientes.css';

const LIMIT = 20;

export function ClientesListPage() {
  const navigate = useNavigate();
  const [buscaInput, setBuscaInput] = useState('');
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<StatusCliente | ''>('');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ page, limit: LIMIT, busca: busca || undefined, status: status || undefined }),
    [page, busca, status],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clientes', params],
    queryFn: () => listClientes(params),
  });

  function handleSubmitBusca(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setBusca(buscaInput.trim());
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Clientes</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/clientes/novo')}>
          + Novo Cliente
        </button>
      </div>

      <form className="clientes-filters" onSubmit={handleSubmitBusca}>
        <input
          type="search"
          placeholder="Buscar por nome ou CNPJ"
          value={buscaInput}
          onChange={(event) => setBuscaInput(event.target.value)}
          className="input"
          aria-label="Buscar por nome ou CNPJ"
        />
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as StatusCliente | '');
          }}
          className="input"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button type="submit" className="btn">
          Buscar
        </button>
      </form>

      <div className="clientes-table-wrapper">
        {isLoading && <p className="clientes-table-status">Carregando...</p>}
        {isError && <p className="clientes-table-status clientes-table-status--error">Não foi possível carregar os clientes.</p>}

        {!isLoading && !isError && (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Cidade/UF</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="clientes-table-status">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
              {data?.data.map((cliente) => (
                <tr key={cliente.id} onClick={() => navigate(`/clientes/${cliente.id}`)}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cnpj}</td>
                  <td>
                    {cliente.cidade}/{cliente.uf}
                  </td>
                  <td>
                    <StatusBadge status={cliente.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </button>
          <span>
            Página {data.meta.page} de {data.meta.totalPages}
          </span>
          <button
            type="button"
            className="btn"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
