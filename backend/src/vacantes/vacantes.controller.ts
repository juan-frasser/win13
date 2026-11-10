import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ReqUsuario, Roles } from '../auth/guards';
import { Rol } from '../auth/rol.enum';
import { AuditarVacanteDto, CrearVacanteDto, FiltroVacantesDto } from './vacantes.dto';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(private vacantes: VacantesService) {}

  @Post() @Roles(Rol.EMPRESA)
  crear(@Req() req: ReqUsuario, @Body() dto: CrearVacanteDto) { return this.vacantes.crear(req.user.id, dto); }

  @Get() @Roles(Rol.ESTUDIANTE)
  buscar(@Query() filtro: FiltroVacantesDto) { return this.vacantes.buscar(filtro); }

  @Get('mias') @Roles(Rol.EMPRESA)
  mias(@Req() req: ReqUsuario) { return this.vacantes.deLaEmpresa(req.user.id); }

  @Get('pendientes') @Roles(Rol.ADMIN)
  pendientes() { return this.vacantes.pendientes(); }

  @Patch(':id/estado') @Roles(Rol.ADMIN)
  auditar(@Param('id') id: string, @Body() dto: AuditarVacanteDto) { return this.vacantes.auditar(id, dto); }
}
