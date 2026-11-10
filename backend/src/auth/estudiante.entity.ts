import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) documentoIdentidad: string;
  @Column() nombres: string;
  @Column() programaAcademico: string;
  @Column() semestreActual: number;
  @OneToOne(() => Usuario, { cascade: true, eager: true }) @JoinColumn() usuario: Usuario;
}
