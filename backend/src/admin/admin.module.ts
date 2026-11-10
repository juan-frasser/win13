import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

// Repositorios y AuthService vienen del AuthModule global.
@Module({ controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}
