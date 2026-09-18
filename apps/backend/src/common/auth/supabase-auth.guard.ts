import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedUser } from './authenticated-user.interface.js';

interface SupabaseAccessTokenPayload {
  sub: string;
  email?: string;
}

/**
 * Valida o access token emitido pelo Supabase Auth (JWT assinado com o
 * SUPABASE_JWT_SECRET do projeto) e expõe o usuário autenticado em `request.user`.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não informado');
    }

    try {
      const secret = this.config.getOrThrow<string>('SUPABASE_JWT_SECRET');
      const payload = jwt.verify(token, secret) as SupabaseAccessTokenPayload;
      const user: AuthenticatedUser = { id: payload.sub, email: payload.email };
      (request as Request & { user: AuthenticatedUser }).user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
