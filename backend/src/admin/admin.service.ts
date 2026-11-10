import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegistroEmpresaDto, RegistroEstudianteDto } from '../auth/auth.dto';
import { AuthService } from '../auth/auth.service';
import { Empresa } from '../auth/empresa.entity';
import { Estudiante } from '../auth/estudiante.entity';
import { Rol } from '../auth/rol.enum';
import { Usuario } from '../auth/usuario.entity';
import { ActualizarEmpresaDto, ActualizarEstudianteDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private auth: AuthService,
    @InjectRepository(Usuario) private usuarios: Repository<Usuario>,
    @InjectRepository(Estudiante) private estudiantes: Repository<Estudiante>,
    @InjectRepository(Empresa) private empresas: Repository<Empresa>,
  ) {}

  listarEstudiantes() { return this.estudiantes.find({ order: { nombres: 'ASC' } }); }
  listarEmpresas() { return this.empresas.find({ order: { razonSocial: 'ASC' } }); }

  // Se recarga la entidad para no devolver el hash de la contraseña recién guardado.
  async crearEstudiante(dto: RegistroEstudianteDto) {
    const { id } = await this.auth.crearEstudiante(dto);
    return this.estudiantes.findOneOrFail({ where: { id } });
  }

  async crearEmpresa(dto: RegistroEmpresaDto) {
    const { id } = await this.auth.crearEmpresa(dto);
    return this.empresas.findOneOrFail({ where: { id } });
  }

  async actualizarEstudiante(id: string, dto: ActualizarEstudianteDto) {
    const actual = await this.estudiantes.findOne({ where: { id } });
    if (!actual) throw new NotFoundException('Estudiante no encontrado');
    if (dto.documentoIdentidad && dto.documentoIdentidad !== actual.documentoIdentidad
      && await this.estudiantes.findOne({ where: { documentoIdentidad: dto.documentoIdentidad } })) {
      throw new ConflictException('El documento ya está registrado');
    }
    await this.estudiantes.update(id, dto);
    return this.estudiantes.findOneOrFail({ where: { id } });
  }

  async actualizarEmpresa(id: string, dto: ActualizarEmpresaDto) {
    const actual = await this.empresas.findOne({ where: { id } });
    if (!actual) throw new NotFoundException('Empresa no encontrada');
    if (dto.nit && dto.nit !== actual.nit && await this.empresas.findOne({ where: { nit: dto.nit } })) {
      throw new ConflictException('El NIT ya está registrado');
    }
    await this.empresas.update(id, dto);
    return this.empresas.findOneOrFail({ where: { id } });
  }

  // Sin servicio de correo, la coordinación define la nueva clave y se la entrega al usuario.
  async restablecerPassword(usuarioId: string, password: string) {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rol === Rol.ADMIN) throw new BadRequestException('No se puede restablecer la clave de un administrador');
    await this.usuarios.update(usuarioId, { password: await bcrypt.hash(password, 10) });
    return { id: usuarioId };
  }

  // Se desactiva en lugar de borrar: conserva la trazabilidad de vacantes y postulaciones.
  async cambiarActivo(usuarioId: string, activo: boolean) {
    const usuario = await this.usuarios.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rol === Rol.ADMIN) throw new BadRequestException('No se puede desactivar a un administrador');
    await this.usuarios.update(usuarioId, { activo });
    return { id: usuarioId, activo };
  }
}
