import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { StatusCliente } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { QueryClienteDto } from './dto/query-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2025';
const PRISMA_UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto, userId: string) {
    try {
      return await this.prisma.cliente.create({
        data: {
          ...dto,
          criadoPor: userId,
          atualizadoPor: userId,
        },
      });
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async findAll(query: QueryClienteDto) {
    const { page, limit, busca, status } = query;

    const where: Prisma.ClienteWhereInput = {
      ...(status ? { status } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { cnpj: { contains: busca, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto, userId: string) {
    try {
      return await this.prisma.cliente.update({
        where: { id },
        data: {
          ...dto,
          atualizadoPor: userId,
        },
      });
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async inativar(id: string, userId: string) {
    return this.setStatus(id, StatusCliente.inativo, userId);
  }

  async ativar(id: string, userId: string) {
    return this.setStatus(id, StatusCliente.ativo, userId);
  }

  private async setStatus(id: string, status: StatusCliente, userId: string) {
    try {
      return await this.prisma.cliente.update({
        where: { id },
        data: { status, atualizadoPor: userId },
      });
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  private mapWriteError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_UNIQUE_VIOLATION) {
        return new ConflictException('Já existe um cliente cadastrado com este CNPJ');
      }
      if (error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR) {
        return new NotFoundException('Cliente não encontrado');
      }
    }
    return error as Error;
  }
}
