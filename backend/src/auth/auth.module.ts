import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Empresa } from './empresa.entity';
import { Estudiante } from './estudiante.entity';
import { Usuario } from './usuario.entity';

// Global: los guards de los demás módulos necesitan JwtService y los repositorios de perfil.
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Estudiante, Empresa]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret-cambiar',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [TypeOrmModule, AuthService],
})
export class AuthModule {}
