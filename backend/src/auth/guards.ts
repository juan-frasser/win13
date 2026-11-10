import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException,
  UseGuards, applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Rol } from './rol.enum';

export interface UsuarioActual { id: string; rol: Rol }

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, @InjectRepository(Usuario) private usuarios: Repository<Usuario>) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException();
    let payload: { sub: string; rol: Rol };
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    // Una cuenta desactivada por la coordinación pierde acceso aunque su token no haya vencido.
    const usuario = await this.usuarios.findOne({ where: { id: payload.sub }, select: { id: true, activo: true } });
    if (!usuario?.activo) throw new UnauthorizedException('Cuenta desactivada');
    req.user = { id: payload.sub, rol: payload.rol } as UsuarioActual;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Rol[]>('roles', [ctx.getHandler(), ctx.getClass()]);
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
