import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class ActualizarEstudianteDto {
  @IsOptional() @IsString() @IsNotEmpty() documentoIdentidad?: string;
  @IsOptional() @IsString() @IsNotEmpty() nombres?: string;
  @IsOptional() @IsString() @IsNotEmpty() programaAcademico?: string;
  @IsOptional() @IsInt() @Min(1) @Max(12) semestreActual?: number;
}

export class ActualizarEmpresaDto {
  @IsOptional() @IsString() @IsNotEmpty() nit?: string;
  @IsOptional() @IsString() @IsNotEmpty() razonSocial?: string;
  @IsOptional() @IsString() @IsNotEmpty() sector?: string;
}

export class CambiarActivoDto {
  @IsBoolean() activo: boolean;
}

export class RestablecerPasswordDto {
  @IsString() @MinLength(8) password: string;
}
