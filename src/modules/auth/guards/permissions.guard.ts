import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Kullanıcının detaylı bilgilerini ve rollerini getir
    const userWithRoles = await this.usersService.findUserWithRoles(user.userId);
    
    if (!userWithRoles) {
      return false;
    }

    // Kullanıcının gerekli izinlere sahip olup olmadığını kontrol et
    return requiredPermissions.some(permission => 
      userWithRoles.hasPermission(permission)
    );
  }
} 