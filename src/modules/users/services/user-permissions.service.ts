import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserPermission } from '../entities/user-permission.entity';

@Injectable()
export class UserPermissionsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
  ) {}

  // Get user with all permissions (role + user specific)
  async getUserWithPermissions(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'roles',
        'roles.rolePermissions',
        'roles.rolePermissions.permission',
        'userPermissions',
        'userPermissions.permission'
      ]
    });
  }

  // Get all available permissions
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { isActive: true },
      order: { module: 'ASC', action: 'ASC' }
    });
  }

  // Get permissions by module
  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module, isActive: true },
      order: { action: 'ASC' }
    });
  }

  // Check if user has permission
  async userHasPermission(userId: number, permissionName: string): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId);
    return user ? user.hasPermission(permissionName) : false;
  }

  // Check if user has any of the permissions
  async userHasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
    const user = await this.getUserWithPermissions(userId);
    return user ? user.hasAnyPermission(permissions) : false;
  }

  // Get user's effective permissions
  async getUserEffectivePermissions(userId: number): Promise<string[]> {
    const user = await this.getUserWithPermissions(userId);
    return user ? user.getEffectivePermissions() : [];
  }

  // Grant permission to user (override)
  async grantPermissionToUser(
    userId: number,
    permissionId: number,
    grantedBy: number,
    options?: {
      expiresAt?: Date;
      reason?: string;
    }
  ): Promise<UserPermission> {
    // Check if permission exists
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId, isActive: true }
    });
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user permission already exists
    let userPermission = await this.userPermissionRepository.findOne({
      where: { userId, permissionId }
    });

    if (userPermission) {
      // Update existing
      userPermission.isGranted = true;
      userPermission.grantedBy = grantedBy;
      userPermission.grantedAt = new Date();
      userPermission.expiresAt = options?.expiresAt || null;
      userPermission.reason = options?.reason || null;
      userPermission.isActive = true;
    } else {
      // Create new
      userPermission = this.userPermissionRepository.create({
        userId,
        permissionId,
        isGranted: true,
        grantedBy,
        grantedAt: new Date(),
        expiresAt: options?.expiresAt || null,
        reason: options?.reason || null,
        isActive: true
      });
    }

    return this.userPermissionRepository.save(userPermission);
  }

  // Revoke permission from user
  async revokePermissionFromUser(
    userId: number,
    permissionId: number,
    revokedBy: number,
    reason?: string
  ): Promise<UserPermission> {
    // Check if user permission exists
    let userPermission = await this.userPermissionRepository.findOne({
      where: { userId, permissionId }
    });

    if (userPermission) {
      // Update existing to revoked
      userPermission.isGranted = false;
      userPermission.grantedBy = revokedBy;
      userPermission.grantedAt = new Date();
      userPermission.reason = reason || 'Permission revoked';
      userPermission.isActive = true;
    } else {
      // Create new revocation record
      userPermission = this.userPermissionRepository.create({
        userId,
        permissionId,
        isGranted: false,
        grantedBy: revokedBy,
        grantedAt: new Date(),
        reason: reason || 'Permission revoked',
        isActive: true
      });
    }

    return this.userPermissionRepository.save(userPermission);
  }

  // Remove user permission (delete record)
  async removeUserPermission(userId: number, permissionId: number): Promise<void> {
    await this.userPermissionRepository.delete({ userId, permissionId });
  }

  // Get user's permission history
  async getUserPermissionHistory(userId: number): Promise<UserPermission[]> {
    return this.userPermissionRepository.find({
      where: { userId },
      relations: ['permission', 'grantedByUser'],
      order: { createdAt: 'DESC' }
    });
  }

  // Get permissions by user
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    return this.userPermissionRepository.find({
      where: { userId, isActive: true },
      relations: ['permission', 'grantedByUser']
    });
  }

  // Bulk grant permissions to user
  async bulkGrantPermissionsToUser(
    userId: number,
    permissionIds: number[],
    grantedBy: number,
    options?: {
      expiresAt?: Date;
      reason?: string;
    }
  ): Promise<UserPermission[]> {
    const results: UserPermission[] = [];
    
    for (const permissionId of permissionIds) {
      try {
        const result = await this.grantPermissionToUser(userId, permissionId, grantedBy, options);
        results.push(result);
      } catch (error) {
        // Continue with other permissions if one fails
        console.error(`Failed to grant permission ${permissionId} to user ${userId}:`, error);
      }
    }

    return results;
  }

  // Get users with specific permission
  async getUsersWithPermission(permissionName: string): Promise<User[]> {
    const permission = await this.permissionRepository.findOne({
      where: { name: permissionName, isActive: true }
    });

    if (!permission) {
      return [];
    }

    // Get users with this permission through roles
    const usersWithRolePermission = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
      .where('rolePermission.permissionId = :permissionId', { permissionId: permission.id })
      .andWhere('rolePermission.isActive = true')
      .andWhere('user.isActive = true')
      .getMany();

    // Get users with direct permission grants
    const usersWithDirectPermission = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userPermissions', 'userPermission')
      .where('userPermission.permissionId = :permissionId', { permissionId: permission.id })
      .andWhere('userPermission.isGranted = true')
      .andWhere('userPermission.isActive = true')
      .andWhere('(userPermission.expiresAt IS NULL OR userPermission.expiresAt > NOW())')
      .andWhere('user.isActive = true')
      .getMany();

    // Merge and deduplicate
    const allUsers = [...usersWithRolePermission, ...usersWithDirectPermission];
    const uniqueUsers = allUsers.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );

    return uniqueUsers;
  }
}