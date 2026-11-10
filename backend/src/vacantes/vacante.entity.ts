import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Empresa } from '../auth/empresa.entity';

export enum EstadoVacante { PENDIENTE = 'PENDIENTE', APROBADA = 'APROBADA', RECHAZADA = 'RECHAZADA' }
export enum Modalidad { PRESENCIAL = 'PRESENCIAL', REMOTA = 'REMOTA', HIBRIDA = 'HIBRIDA' }

@Entity()
export class Vacante {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() titulo: string;
  @Column() descripcion: string;
  @Column() requisitos: string;
  @Column() programa: string;
  @Column({ type: 'simple-enum', enum: Modalidad }) modalidad: Modalidad;
  @Column({ default: 0 }) apoyoSostenimiento: number;
  @Column({ type: 'simple-enum', enum: EstadoVacante, default: EstadoVacante.PENDIENTE }) estado: EstadoVacante;
  @ManyToOne(() => Empresa, { eager: true }) empresa: Empresa;
  @CreateDateColumn() creadaEn: Date;
}
