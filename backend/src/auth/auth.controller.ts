import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, RegistroEmpresaDto, RegistroEstudianteDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('registro/estudiante') registrarEstudiante(@Body() dto: RegistroEstudianteDto) {
    return this.auth.registrarEstudiante(dto);
  }
  @Post('registro/empresa') registrarEmpresa(@Body() dto: RegistroEmpresaDto) {
    return this.auth.registrarEmpresa(dto);
  }
  @Post('login') login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
