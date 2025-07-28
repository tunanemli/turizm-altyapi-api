import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserWithRoles(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async assignRole(userId: number, roleId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!user || !role) {
      return null;
    }

    // Eğer kullanıcının bu rolü yoksa ekle
    if (!user.roles.some(r => r.id === roleId)) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }

    return user;
  }

  async removeRole(userId: number, roleId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      return null;
    }

    user.roles = user.roles.filter(role => role.id !== roleId);
    await this.userRepository.save(user);

    return user;
  }

  async assignRoleByName(userId: number, roleName: string): Promise<User | null> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      return null;
    }

    return this.assignRole(userId, role.id);
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    return user?.roles || [];
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.findUserWithRoles(userId);
    
    if (!user) {
      return [];
    }

    const permissions = new Set<string>();
    
    user.roles?.forEach(role => {
      role.permissions?.forEach(permission => {
        permissions.add(permission);
      });
    });

    return Array.from(permissions);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }
} 