import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { R2StorageService } from '../../admin/videos/services/r2-storage.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, R2StorageService],
  exports: [UsersService],
})
export class UsersModule {}
