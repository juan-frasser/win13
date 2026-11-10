import { ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto, RegistroEmpresaDto, RegistroEstudianteDto } from './auth.dto';
import { Empresa } from './empresa.entity';
import { Estudiante } from './estudiante.entity';
import { Rol } from './rol.enum';
import { Usuario } from './usuario.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario) private usuarios: Repository<Usuario>,
    @InjectRepository(Estudiante) private estudiantes: Repository<Estudiante>,
    @InjectRepository(Empresa) private empresas: Repository<Empresa>,
    private jwt: JwtService,
  ) {}

  // El administrador (coordinación) no se auto-registra: se siembra al arrancar.
  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL ?? 'admin@ucn.edu.co';
    if (await this.usuarios.findOne({ where: { email } })) return;
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin12345', 10);
    await this.usuarios.save({ email, password, rol: Rol.ADMIN });
  }

  async registrarEstudiante(dto: RegistroEstudianteDto) {
    return this.token((await this.crearEstudiante(dto)).usuario);
  }

  async registrarEmpresa(dto: RegistroEmpresaDto) {
    return this.token((await this.crearEmpresa(dto)).usuario);
  }

  // Compartidos por el auto-registro y por el módulo de administración (UC1 del Taller 2).
  async crearEstudiante({ email, password, ...perfil }: RegistroEstudianteDto) {
    const usuario = await this.nuevoUsuario(email, password, Rol.ESTUDIANTE);
    if (await this.estudiantes.findOne({ where: { documentoIdentidad: perfil.documentoIdentidad } })) {
      throw new ConflictException('El documento ya está registrado');
    }
    return this.estudiantes.save({ ...perfil, usuario });
  }

  async crearEmpresa({ email, password, ...perfil }: RegistroEmpresaDto) {
    const usuario = await this.nuevoUsuario(email, password, Rol.EMPRESA);
    if (await this.empresas.findOne({ where: { nit: perfil.nit } })) {
      throw new ConflictException('El NIT ya está registrado');
    }
    return this.empresas.save({ ...perfil, usuario });
  }

  async login({ email, password }: LoginDto) {
    const usuario = await this.usuarios.findOne({
      where: { email },
      select: { id: true, rol: true, password: true, activo: true },
    });
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (usuario.activo === false) throw new UnauthorizedException('Cuenta desactivada');
    return this.token(usuario);
  }

  private async nuevoUsuario(email: string, password: string, rol: Rol) {
    if (await this.usuarios.findOne({ where: { email } })) {
      throw new ConflictException('El correo ya está registrado');
    }
    return { email, password: await bcrypt.hash(password, 10), rol } as Usuario;
  }

  private token(usuario: Pick<Usuario, 'id' | 'rol'>) {
    return { accessToken: this.jwt.sign({ sub: usuario.id, rol: usuario.rol }), rol: usuario.rol };
  }
}
