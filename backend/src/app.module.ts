import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { VacantesModule } from './vacantes/vacantes.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { Usuario } from './auth/usuario.entity';
import { Empresa } from './auth/empresa.entity';
import { Estudiante } from './auth/estudiante.entity';
import { Vacante } from './vacantes/vacante.entity';
import { Postulacion } from './postulaciones/postulacion.entity';

const entities = [Usuario, Empresa, Estudiante, Vacante, Postulacion];

// DB_TYPE=sqljs usa una base en memoria (pruebas y demo sin Docker); por defecto PostgreSQL.
export function dbConfig(): TypeOrmModuleOptions {
  if (process.env.DB_TYPE === 'sqljs') {
    return { type: 'sqljs', entities, synchronize: true };
  }
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'practicas',
    password: process.env.DB_PASSWORD ?? 'practicas',
    database: process.env.DB_NAME ?? 'practicas',
    entities,
    synchronize: true, // prototipo: sin migraciones
  };
}

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig()), AuthModule, AdminModule, VacantesModule, PostulacionesModule],
})
export class AppModule {}
