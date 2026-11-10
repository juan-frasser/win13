import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacante } from './vacante.entity';
import { VacantesController } from './vacantes.controller';
import { VacantesService } from './vacantes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vacante])],
  controllers: [VacantesController],
  providers: [VacantesService],
  exports: [TypeOrmModule],
})
export class VacantesModule {}
