import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RoleService } from './services/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UsersService, RoleService],
  controllers: [UsersController],
  exports: [UsersService, RoleService],
})
export class UsersModule {} 