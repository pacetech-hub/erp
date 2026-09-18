import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { StatusCliente } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ClientesService } from './clientes.service.js';

const USER_ID = 'e2b1c9b0-4b1a-4a3a-9b1a-0f1a2b3c4d5e';

function createPrismaMock() {
  return {
    cliente: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

describe('ClientesService', () => {
  let service: ClientesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClientesService);
  });

  describe('create', () => {
    it('grava o cliente com os campos de auditoria de criação', async () => {
      const dto = {
        nome: 'Loja Exemplo',
        cnpj: '11.222.333/0001-81',
        endereco: 'Rua A, 100, Centro',
        cidade: 'São Paulo',
        uf: 'SP',
      };
      prisma.cliente.create.mockResolvedValue({ id: '1', ...dto });

      await service.create(dto, USER_ID);

      expect(prisma.cliente.create).toHaveBeenCalledWith({
        data: { ...dto, criadoPor: USER_ID, atualizadoPor: USER_ID },
      });
    });

    it('lança ConflictException quando o CNPJ já existe', async () => {
      prisma.cliente.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.10.0',
        }),
      );

      await expect(
        service.create(
          {
            nome: 'Loja Exemplo',
            cnpj: '11.222.333/0001-81',
            endereco: 'Rua A, 100',
            cidade: 'São Paulo',
            uf: 'SP',
          },
          USER_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findOne', () => {
    it('lança NotFoundException quando o cliente não existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('retorna o cliente quando encontrado', async () => {
      const cliente = { id: '1', nome: 'Loja Exemplo' };
      prisma.cliente.findUnique.mockResolvedValue(cliente);

      await expect(service.findOne('1')).resolves.toEqual(cliente);
    });
  });

  describe('findAll', () => {
    it('filtra por busca (nome/cnpj) e status, com paginação', async () => {
      prisma.$transaction.mockResolvedValue([[{ id: '1' }], 1]);

      const result = await service.findAll({
        page: 2,
        limit: 10,
        busca: 'Exemplo',
        status: StatusCliente.ativo,
      });

      expect(prisma.cliente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: StatusCliente.ativo,
            OR: [
              { nome: { contains: 'Exemplo', mode: 'insensitive' } },
              { cnpj: { contains: 'Exemplo', mode: 'insensitive' } },
            ],
          },
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toEqual({ total: 1, page: 2, limit: 10, totalPages: 1 });
    });
  });

  describe('inativar / ativar', () => {
    it('atualiza o status para inativo registrando o autor', async () => {
      prisma.cliente.update.mockResolvedValue({ id: '1', status: StatusCliente.inativo });

      await service.inativar('1', USER_ID);

      expect(prisma.cliente.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: StatusCliente.inativo, atualizadoPor: USER_ID },
      });
    });

    it('atualiza o status para ativo registrando o autor', async () => {
      prisma.cliente.update.mockResolvedValue({ id: '1', status: StatusCliente.ativo });

      await service.ativar('1', USER_ID);

      expect(prisma.cliente.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: StatusCliente.ativo, atualizadoPor: USER_ID },
      });
    });
  });
});
