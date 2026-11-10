import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Empresa } from '../auth/empresa.entity';
import { AuditarVacanteDto, CrearVacanteDto, FiltroVacantesDto } from './vacantes.dto';
import { EstadoVacante, Vacante } from './vacante.entity';

@Injectable()
export class VacantesService {
  constructor(
    @InjectRepository(Vacante) private vacantes: Repository<Vacante>,
    @InjectRepository(Empresa) private empresas: Repository<Empresa>,
  ) {}

  // RF-02: toda vacante nace PENDIENTE hasta que la coordinación la audite (RF-04).
  async crear(usuarioId: string, dto: CrearVacanteDto) {
    const empresa = await this.empresas.findOne({ where: { usuario: { id: usuarioId } } });
    if (!empresa) throw new NotFoundException('Perfil de empresa no encontrado');
    return this.vacantes.save({ ...dto, estado: EstadoVacante.PENDIENTE, empresa });
  }

  // Búsqueda del estudiante: solo vacantes aprobadas.
  buscar({ q, programa, modalidad }: FiltroVacantesDto) {
    const base: FindOptionsWhere<Vacante> = { estado: EstadoVacante.APROBADA, activa: true };
    if (programa) base.programa = programa;
    if (modalidad) base.modalidad = modalidad;
    const where = q
      ? [{ ...base, titulo: Like(`%${q}%`) }, { ...base, descripcion: Like(`%${q}%`) }]
      : base;
    return this.vacantes.find({ where, order: { creadaEn: 'DESC' } });
  }

  deLaEmpresa(usuarioId: string) {
    return this.vacantes.find({ where: { empresa: { usuario: { id: usuarioId } } }, order: { creadaEn: 'DESC' } });
  }

  // La empresa cierra o reabre su vacante; los postulantes actuales no se ven afectados.
  async cambiarActiva(usuarioId: string, id: string, activa: boolean) {
    const vacante = await this.vacantes.findOne({ where: { id } });
    if (!vacante) throw new NotFoundException('Vacante no encontrada');
    if (vacante.empresa.usuario.id !== usuarioId) throw new ForbiddenException('La vacante pertenece a otra empresa');
    return this.vacantes.save({ ...vacante, activa });
  }

  pendientes() {
    return this.vacantes.find({ where: { estado: EstadoVacante.PENDIENTE }, order: { creadaEn: 'ASC' } });
  }

  async auditar(id: string, { estado }: AuditarVacanteDto) {
    const vacante = await this.vacantes.findOne({ where: { id } });
    if (!vacante) throw new NotFoundException('Vacante no encontrada');
    if (vacante.estado !== EstadoVacante.PENDIENTE) {
      throw new BadRequestException('Solo se pueden auditar vacantes pendientes');
    }
    return this.vacantes.save({ ...vacante, estado });
  }
}
