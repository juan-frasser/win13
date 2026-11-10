import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { EstadoVacante, Modalidad } from './vacante.entity';

export class CrearVacanteDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsString() @IsNotEmpty() descripcion: string;
  @IsString() @IsNotEmpty() requisitos: string;
  @IsString() @IsNotEmpty() programa: string;
  @IsEnum(Modalidad) modalidad: Modalidad;
  @IsInt() @Min(0) apoyoSostenimiento: number;
}

export class FiltroVacantesDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() programa?: string;
  @IsOptional() @IsEnum(Modalidad) modalidad?: Modalidad;
}

export class AuditarVacanteDto {
  @IsEnum([EstadoVacante.APROBADA, EstadoVacante.RECHAZADA]) estado: EstadoVacante;
}
