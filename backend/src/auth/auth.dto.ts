import { IsEmail, IsInt, IsNotEmpty, IsString, Max, Min, MinLength } from 'class-validator';

class CredencialesDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}

export class RegistroEstudianteDto extends CredencialesDto {
  @IsString() @IsNotEmpty() documentoIdentidad: string;
  @IsString() @IsNotEmpty() nombres: string;
  @IsString() @IsNotEmpty() programaAcademico: string;
  @IsInt() @Min(1) @Max(12) semestreActual: number;
}

export class RegistroEmpresaDto extends CredencialesDto {
  @IsString() @IsNotEmpty() nit: string;
  @IsString() @IsNotEmpty() razonSocial: string;
  @IsString() @IsNotEmpty() sector: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}
