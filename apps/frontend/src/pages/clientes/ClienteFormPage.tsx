import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ativarCliente,
  createCliente,
  getCliente,
  inativarCliente,
  updateCliente,
} from '../../api/clientes';
import { StatusBadge } from '../../components/StatusBadge';
import { mascararCnpj } from '../../utils/cnpj';
import { UFS_BRASIL } from '../../utils/uf';
import { clienteFormSchema, type ClienteFormSchema } from './cliente-form.schema';
import './clientes.css';

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdicao = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [erro, setErro] = useState<string | null>(null);

  const clienteQuery = useQuery({
    queryKey: ['clientes', id],
    queryFn: () => getCliente(id!),
    enabled: isEdicao,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormSchema>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      inscricaoEstadual: '',
      endereco: '',
      cidade: '',
      uf: undefined,
    },
  });

  useEffect(() => {
    if (clienteQuery.data) {
      reset({
        nome: clienteQuery.data.nome,
        cnpj: clienteQuery.data.cnpj,
        inscricaoEstadual: clienteQuery.data.inscricaoEstadual ?? '',
        endereco: clienteQuery.data.endereco,
        cidade: clienteQuery.data.cidade,
        uf: clienteQuery.data.uf as ClienteFormSchema['uf'],
      });
    }
  }, [clienteQuery.data, reset]);

  const salvarMutation = useMutation({
    mutationFn: (values: ClienteFormSchema) =>
      isEdicao ? updateCliente(id!, values) : createCliente(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      navigate('/clientes');
    },
    onError: (error: unknown) => {
      setErro(extrairMensagemErro(error));
    },
  });

  const statusMutation = useMutation({
    mutationFn: () =>
      clienteQuery.data?.status === 'ativo' ? inativarCliente(id!) : ativarCliente(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', id] });
    },
    onError: (error: unknown) => {
      setErro(extrairMensagemErro(error));
    },
  });

  function onSubmit(values: ClienteFormSchema) {
    setErro(null);
    salvarMutation.mutate(values);
  }

  if (isEdicao && clienteQuery.isLoading) {
    return (
      <div className="page">
        <p className="clientes-table-status">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>{isEdicao ? 'Cliente' : 'Novo Cliente'}</h1>
        {isEdicao && clienteQuery.data && (
          <div className="page__header-actions">
            <StatusBadge status={clienteQuery.data.status} />
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => statusMutation.mutate()}
              disabled={statusMutation.isPending}
            >
              {clienteQuery.data.status === 'ativo' ? 'Inativar Cliente' : 'Ativar Cliente'}
            </button>
          </div>
        )}
      </div>

      {erro && <p className="form-error form-error--geral">{erro}</p>}

      <form className="cliente-form" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="cliente-form__section">
          <legend>Dados Cadastrais</legend>

          <div className="form-field">
            <label htmlFor="nome">Nome da loja</label>
            <input id="nome" className="input" {...register('nome')} />
            {errors.nome && <span className="form-error">{errors.nome.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="cnpj">CNPJ</label>
            <Controller
              control={control}
              name="cnpj"
              render={({ field }) => (
                <input
                  id="cnpj"
                  className="input"
                  placeholder="00.000.000/0000-00"
                  value={field.value}
                  onChange={(event) => field.onChange(mascararCnpj(event.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
            {errors.cnpj && <span className="form-error">{errors.cnpj.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="inscricaoEstadual">Inscrição Estadual (opcional)</label>
            <input id="inscricaoEstadual" className="input" {...register('inscricaoEstadual')} />
          </div>

          <div className="form-field">
            <label htmlFor="endereco">Endereço (logradouro, número e bairro)</label>
            <input id="endereco" className="input" {...register('endereco')} />
            {errors.endereco && <span className="form-error">{errors.endereco.message}</span>}
          </div>

          <div className="cliente-form__row">
            <div className="form-field">
              <label htmlFor="cidade">Cidade</label>
              <input id="cidade" className="input" {...register('cidade')} />
              {errors.cidade && <span className="form-error">{errors.cidade.message}</span>}
            </div>

            <div className="form-field form-field--uf">
              <label htmlFor="uf">UF</label>
              <select id="uf" className="input" {...register('uf')}>
                <option value="">--</option>
                {UFS_BRASIL.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              {errors.uf && <span className="form-error">{errors.uf.message}</span>}
            </div>
          </div>
        </fieldset>

        <div className="cliente-form__actions">
          <button type="button" className="btn" onClick={() => navigate('/clientes')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

function extrairMensagemErro(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string | string[] } } }).response?.data
      ?.message !== 'undefined'
  ) {
    const message = (error as { response: { data: { message: string | string[] } } }).response
      .data.message;
    return Array.isArray(message) ? message.join(', ') : message;
  }
  return 'Não foi possível salvar o cliente. Tente novamente.';
}
