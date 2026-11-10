import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from './rol.enum';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ select: false }) password: string; // nunca se carga en relaciones ni respuestas
  @Column({ type: 'simple-enum', enum: Rol }) rol: Rol;
  @Column({ default: true }) activo: boolean;
}
