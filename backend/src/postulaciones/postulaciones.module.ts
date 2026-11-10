import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacante } from '../vacantes/vacante.entity';
import { PostulacionesController } from './postulaciones.controller';
import { Postulacion } from './postulacion.entity';
import { PostulacionesService } from './postulaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Postulacion, Vacante])],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
})
export class PostulacionesModule {}
