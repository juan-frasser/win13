import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException,
  UseGuards, applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Rol } from './rol.enum';

export interface UsuarioActual { id: string; rol: Rol }

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException();
    try {
      const { sub, rol } = this.jwt.verify(token);
      req.user = { id: sub, rol } as UsuarioActual;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.get<Rol[]>('roles', ctx.getHandler());
    const { user } = ctx.switchToHttp().getRequest();
    if (!roles.includes(user.rol)) throw new ForbiddenException('Rol sin permiso para esta acción');
    return true;
  }
}

/** Exige JWT válido y que el rol del usuario esté entre los indicados (RF-01). */
export const Roles = (...roles: Rol[]) =>
  applyDecorators(SetMetadata('roles', roles), UseGuards(JwtAuthGuard, RolesGuard));

/** Petición ya autenticada por JwtAuthGuard. */
export interface ReqUsuario { user: UsuarioActual }
