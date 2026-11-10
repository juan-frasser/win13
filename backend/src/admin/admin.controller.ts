import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RegistroEmpresaDto, RegistroEstudianteDto } from '../auth/auth.dto';
import { Roles } from '../auth/guards';
import { Rol } from '../auth/rol.enum';
import { ActualizarEmpresaDto, ActualizarEstudianteDto, CambiarActivoDto } from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(Rol.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('estudiantes') estudiantes() { return this.admin.listarEstudiantes(); }
  @Post('estudiantes') crearEstudiante(@Body() dto: RegistroEstudianteDto) { return this.admin.crearEstudiante(dto); }
  @Patch('estudiantes/:id') actualizarEstudiante(@Param('id') id: string, @Body() dto: ActualizarEstudianteDto) {
    return this.admin.actualizarEstudiante(id, dto);
  }

  @Get('empresas') empresas() { return this.admin.listarEmpresas(); }
  @Post('empresas') crearEmpresa(@Body() dto: RegistroEmpresaDto) { return this.admin.crearEmpresa(dto); }
  @Patch('empresas/:id') actualizarEmpresa(@Param('id') id: string, @Body() dto: ActualizarEmpresaDto) {
    return this.admin.actualizarEmpresa(id, dto);
  }

  @Patch('usuarios/:id/activo') cambiarActivo(@Param('id') id: string, @Body() { activo }: CambiarActivoDto) {
    return this.admin.cambiarActivo(id, activo);
  }
}
