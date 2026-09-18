import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StatusCliente } from '../../../generated/prisma/enums.js';

export class QueryClienteDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  /** Busca por nome (parcial, case-insensitive) ou CNPJ. */
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsEnum(StatusCliente)
  status?: StatusCliente;
}
