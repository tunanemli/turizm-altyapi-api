import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RoleService } from './services/role.service';
import { UserPermissionsService } from './services/user-permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      RolePermission,
      UserPermission,
    ])
  ],
  providers: [
    UsersService,
    RoleService,
    UserPermissionsService,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    RoleService,
    UserPermissionsService,
  ],
})
export class UsersModule {} 