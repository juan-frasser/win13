import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ReqUsuario, Roles } from '../auth/guards';
import { Rol } from '../auth/rol.enum';
import { CambiarEstadoDto, PostularDto } from './postulaciones.dto';
import { PostulacionesService } from './postulaciones.service';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(private postulaciones: PostulacionesService) {}

  @Post() @Roles(Rol.ESTUDIANTE)
  postular(@Req() req: ReqUsuario, @Body() dto: PostularDto) { return this.postulaciones.postular(req.user.id, dto.vacanteId); }

  @Get('mias') @Roles(Rol.ESTUDIANTE)
  mias(@Req() req: ReqUsuario) { return this.postulaciones.deEstudiante(req.user.id); }

  @Get('candidatos') @Roles(Rol.EMPRESA)
  candidatos(@Req() req: ReqUsuario) { return this.postulaciones.candidatos(req.user.id); }

  @Patch(':id/estado') @Roles(Rol.EMPRESA)
  cambiarEstado(@Req() req: ReqUsuario, @Param('id') id: string, @Body() dto: CambiarEstadoDto) {
    return this.postulaciones.cambiarEstado(req.user.id, id, dto);
  }
}
