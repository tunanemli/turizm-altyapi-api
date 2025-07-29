import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto, AdminChangePasswordDto } from './dto/user-permission.dto';
import * as bcrypt from 'bcrypt';

interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, ...userData } = createUserDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create user
    const user = this.userRepository.create(userData);

    // Handle roles if provided
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds), isActive: true }
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }

      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async findAll(options: FindAllOptions): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, search, role, isActive } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.userPermissions', 'userPermission')
      .leftJoinAndSelect('userPermission.permission', 'permission');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR user.companyName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const users = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'roles',
        'roles.rolePermissions',
        'roles.rolePermissions.permission',
        'userPermissions',
        'userPermissions.permission'
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.rolePermissions', 'roles.rolePermissions.permission']
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { roleIds, ...userData } = updateUserDto;
    
    const user = await this.findOne(id);

    // Update basic user data
    Object.assign(user, userData);

    // Handle roles if provided
    if (roleIds !== undefined) {
      if (roleIds.length > 0) {
        const roles = await this.roleRepository.find({
          where: { id: In(roleIds), isActive: true }
        });

        if (roles.length !== roleIds.length) {
          throw new BadRequestException('One or more roles not found');
        }

        user.roles = roles;
      } else {
        user.roles = [];
      }
    }

    return this.userRepository.save(user);
  }

  async deactivate(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async activate(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = true;
    await this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // ==================== PASSWORD MANAGEMENT ====================

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
  }

  async adminChangePassword(id: number, adminChangePasswordDto: AdminChangePasswordDto): Promise<void> {
    const user = await this.findOne(id);

    // Hash new password
    const hashedPassword = await bcrypt.hash(adminChangePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    // TODO: Log admin password change with reason
    console.log(`Admin changed password for user ${id}. Reason: ${adminChangePasswordDto.reason || 'Not provided'}`);
  }

  // ==================== ROLE MANAGEMENT ====================

  async updateUserRoles(id: number, roleIds: number[]): Promise<User> {
    const user = await this.findOne(id);

    if (roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds), isActive: true }
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }

      user.roles = roles;
    } else {
      user.roles = [];
    }

    return this.userRepository.save(user);
  }

  async addRoleToUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findOne(userId);
    const role = await this.roleRepository.findOne({
      where: { id: roleId, isActive: true }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user already has this role
    const hasRole = user.roles?.some(r => r.id === roleId);
    if (hasRole) {
      throw new BadRequestException('User already has this role');
    }

    if (!user.roles) {
      user.roles = [];
    }

    user.roles.push(role);
    return this.userRepository.save(user);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findOne(userId);

    if (!user.roles) {
      throw new BadRequestException('User has no roles');
    }

    const roleIndex = user.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      throw new BadRequestException('User does not have this role');
    }

    user.roles.splice(roleIndex, 1);
    return this.userRepository.save(user);
  }

  // ==================== UTILITY METHODS ====================

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: { role: string; count: number }[];
  }> {
    const [total, active, verified] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { isEmailVerified: true } }),
    ]);

    const roleStats = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .select('role.name', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.isActive = true')
      .groupBy('role.name')
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      verified,
      unverified: total - verified,
      byRole: roleStats.map(stat => ({
        role: stat.role || 'No Role',
        count: parseInt(stat.count),
      })),
    };
  }

  async searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
    return this.userRepository.find({
      where: [
        { firstName: Like(`%${searchTerm}%`) },
        { lastName: Like(`%${searchTerm}%`) },
        { email: Like(`%${searchTerm}%`) },
        { companyName: Like(`%${searchTerm}%`) },
      ],
      relations: ['roles'],
      take: limit,
      order: { firstName: 'ASC' },
    });
  }

  async markEmailAsVerified(userId: number): Promise<void> {
    await this.userRepository.update(userId, { isEmailVerified: true });
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  // ==================== LEGACY METHODS (Updated for backward compatibility) ====================

  async create_legacy(userData: Partial<User>): Promise<User> {
    // Convert legacy call to new DTO format
    const createUserDto: CreateUserDto = {
      email: userData.email!,
      password: userData.password!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone,
      companyName: userData.companyName,
      department: userData.department,
      isActive: userData.isActive,
      isEmailVerified: userData.isEmailVerified,
    };

    return this.create(createUserDto);
  }

  async update_legacy(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      return await this.update(id, userData as UpdateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }
} 