import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { IsCnpj } from '../../../common/validators/is-cnpj.validator.js';
import { UFS_BRASIL } from '../../../common/utils/uf.util.js';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'nome é obrigatório' })
  @MaxLength(255)
  nome!: string;

  @IsString()
  @IsNotEmpty({ message: 'cnpj é obrigatório' })
  @IsCnpj()
  cnpj!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  inscricaoEstadual?: string;

  @IsString()
  @IsNotEmpty({ message: 'endereco é obrigatório' })
  @MaxLength(255)
  endereco!: string;

  @IsString()
  @IsNotEmpty({ message: 'cidade é obrigatória' })
  @MaxLength(100)
  cidade!: string;

  @IsString()
  @Length(2, 2, { message: 'uf deve ter 2 letras' })
  @IsIn(UFS_BRASIL, { message: 'uf inválida' })
  uf!: string;
}
