import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { ROLE_PERMISSIONS } from '../constants/permissions';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    const role = this.roleRepository.create({
      ...data,
      permissions: data.permissions || [],
    });
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, data);
    return this.findOne(id);
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleRepository.update(id, { isActive: false });
  }

  async addPermissionToRole(roleId: number, permission: string): Promise<Role | null> {
    const role = await this.findOne(roleId);
    if (!role) return null;

    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }

    return role;
  }

  async removePermissionFromRole(roleId: number, permission: string): Promise<Role | null> {
    const role = await this.findOne(roleId);
    if (!role) return null;

    role.permissions = role.permissions.filter(p => p !== permission);
    await this.roleRepository.save(role);

    return role;
  }

  // Varsayılan rolleri oluşturur
  async seedDefaultRoles(): Promise<void> {
    const existingRoles = await this.roleRepository.find();
    
    if (existingRoles.length === 0) {
      const defaultRoles = [
        {
          name: 'super_admin',
          displayName: 'Super Admin',
          description: 'Full system access',
          permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        },
        {
          name: 'admin',
          displayName: 'Admin',
          description: 'Administrative access',
          permissions: ROLE_PERMISSIONS.ADMIN,
        },
        {
          name: 'manager',
          displayName: 'Manager',
          description: 'Hotel and reservation management',
          permissions: ROLE_PERMISSIONS.MANAGER,
        },
        {
          name: 'agent',
          displayName: 'Travel Agent',
          description: 'Basic hotel and reservation access',
          permissions: ROLE_PERMISSIONS.AGENT,
        },
        {
          name: 'customer',
          displayName: 'Customer',
          description: 'Customer access',
          permissions: ROLE_PERMISSIONS.CUSTOMER,
        },
      ];

      for (const roleData of defaultRoles) {
        await this.createRole(roleData);
      }
    }
  }
} 