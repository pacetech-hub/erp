import { z } from 'zod';
import { isCnpjValido } from '../../utils/cnpj';
import { UFS_BRASIL } from '../../utils/uf';

export const clienteFormSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da loja'),
  cnpj: z
    .string()
    .trim()
    .min(1, 'Informe o CNPJ')
    .refine(isCnpjValido, 'CNPJ inválido. Use o formato 00.000.000/0000-00'),
  inscricaoEstadual: z.string().trim().optional().or(z.literal('')),
  endereco: z.string().trim().min(1, 'Informe o endereço (logradouro, número e bairro)'),
  cidade: z.string().trim().min(1, 'Informe a cidade'),
  uf: z.enum(UFS_BRASIL, { message: 'Selecione a UF' }),
});

export type ClienteFormSchema = z.infer<typeof clienteFormSchema>;
