import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) nit: string;
  @Column() razonSocial: string;
  @Column() sector: string;
  @OneToOne(() => Usuario, { cascade: true, eager: true }) @JoinColumn() usuario: Usuario;
}
