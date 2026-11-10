import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Estudiante } from '../auth/estudiante.entity';
import { Vacante } from '../vacantes/vacante.entity';

export enum EstadoPostulacion {
  POSTULADO = 'POSTULADO',
  EN_ENTREVISTA = 'EN_ENTREVISTA',
  SELECCIONADO = 'SELECCIONADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity()
@Unique(['estudiante', 'vacante'])
export class Postulacion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'simple-enum', enum: EstadoPostulacion, default: EstadoPostulacion.POSTULADO }) estado: EstadoPostulacion;
  @ManyToOne(() => Estudiante, { eager: true }) estudiante: Estudiante;
  @ManyToOne(() => Vacante, { eager: true }) vacante: Vacante;
  @CreateDateColumn() fechaPostulacion: Date;
}
