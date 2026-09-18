import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user.interface.js';
import { SupabaseAuthGuard } from '../../common/auth/supabase-auth.guard.js';
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { QueryClienteDto } from './dto/query-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@UseGuards(SupabaseAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() dto: CreateClienteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.clientesService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: QueryClienteDto) {
    return this.clientesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClienteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clientesService.update(id, dto, user.id);
  }

  @Patch(':id/inativar')
  inativar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.clientesService.inativar(id, user.id);
  }

  @Patch(':id/ativar')
  ativar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.clientesService.ativar(id, user.id);
  }
}
