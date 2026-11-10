import { IsEnum, IsUUID } from 'class-validator';
import { EstadoPostulacion } from './postulacion.entity';

export class PostularDto { @IsUUID() vacanteId: string }
export class CambiarEstadoDto { @IsEnum(EstadoPostulacion) estado: EstadoPostulacion }
