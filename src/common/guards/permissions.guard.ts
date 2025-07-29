import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserPermissionsService } from '../../modules/users/services/user-permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userPermissionsService: UserPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Handle different permission requirement types
      if (Array.isArray(requiredPermissions)) {
        // Simple array of permissions (all required)
        const hasPermissions = await this.checkAllPermissions(user.sub, requiredPermissions);
        if (!hasPermissions) {
          throw new ForbiddenException('Insufficient permissions');
        }
      } else if (typeof requiredPermissions === 'object') {
        // Complex permission requirements
        if (requiredPermissions.any) {
          // User needs ANY of these permissions
          const hasAnyPermission = await this.userPermissionsService.userHasAnyPermission(
            user.sub,
            requiredPermissions.any
          );
          if (!hasAnyPermission) {
            throw new ForbiddenException('Insufficient permissions');
          }
        } else if (requiredPermissions.all) {
          // User needs ALL of these permissions
          const hasAllPermissions = await this.checkAllPermissions(user.sub, requiredPermissions.all);
          if (!hasAllPermissions) {
            throw new ForbiddenException('Insufficient permissions');
          }
        }
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Permission check failed');
    }
  }

  private async checkAllPermissions(userId: number, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      const hasPermission = await this.userPermissionsService.userHasPermission(userId, permission);
      if (!hasPermission) {
        return false;
      }
    }
    return true;
  }
}