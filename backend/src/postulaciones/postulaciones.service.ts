import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from '../auth/estudiante.entity';
import { EstadoVacante, Vacante } from '../vacantes/vacante.entity';
import { CambiarEstadoDto } from './postulaciones.dto';
import { Postulacion } from './postulacion.entity';

@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(Postulacion) private postulaciones: Repository<Postulacion>,
    @InjectRepository(Vacante) private vacantes: Repository<Vacante>,
    @InjectRepository(Estudiante) private estudiantes: Repository<Estudiante>,
  ) {}

  // RF-03: el estudiante solo se postula a vacantes aprobadas, una vez por vacante.
  async postular(usuarioId: string, vacanteId: string) {
    const estudiante = await this.estudiantes.findOne({ where: { usuario: { id: usuarioId } } });
    if (!estudiante) throw new NotFoundException('Perfil de estudiante no encontrado');
    const vacante = await this.vacantes.findOne({ where: { id: vacanteId } });
    if (!vacante || vacante.estado !== EstadoVacante.APROBADA) {
      throw new BadRequestException('La vacante no está disponible para postulación');
    }
    const existente = await this.postulaciones.findOne({
      where: { estudiante: { id: estudiante.id }, vacante: { id: vacanteId } },
    });
    if (existente) throw new ConflictException('Ya te postulaste a esta vacante');
    return this.postulaciones.save({ estudiante, vacante });
  }

  deEstudiante(usuarioId: string) {
    return this.postulaciones.find({
      where: { estudiante: { usuario: { id: usuarioId } } },
      order: { fechaPostulacion: 'DESC' },
    });
  }

  candidatos(usuarioId: string) {
    return this.postulaciones.find({
      where: { vacante: { empresa: { usuario: { id: usuarioId } } } },
      order: { fechaPostulacion: 'DESC' },
    });
  }

  // RF-05: solo la empresa dueña de la vacante cambia el estado del candidato.
  async cambiarEstado(usuarioId: string, id: string, { estado }: CambiarEstadoDto) {
    const postulacion = await this.postulaciones.findOne({ where: { id } });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    if (postulacion.vacante.empresa.usuario.id !== usuarioId) {
      throw new ForbiddenException('La vacante pertenece a otra empresa');
    }
    return this.postulaciones.save({ ...postulacion, estado });
  }
}
