import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserPermissionsService } from '../users/services/user-permissions.service';
import { User } from '../users/entities/user.entity';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    isEmailVerified: boolean;
    roles: string[];
    permissions: string[];
  };
}

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userPermissionsService: UserPermissionsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user's full data with permissions
    const userWithPermissions = await this.userPermissionsService.getUserWithPermissions(user.id);
    
    if (!userWithPermissions) {
      throw new UnauthorizedException('User data not found');
    }

    // Get effective permissions
    const permissions = userWithPermissions.getEffectivePermissions();
    const roleNames = userWithPermissions.roles?.map(role => role.name) || [];

    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roleNames,
      permissions: permissions,
    };

    // Generate JWT token
    const access_token = await this.jwtService.signAsync(payload);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        roles: roleNames,
        permissions: permissions,
      },
    };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    department?: string;
  }): Promise<LoginResponse> {
    try {
      // Create user with default customer role (roleId: 4)
      const user = await this.usersService.create({
        ...userData,
        roleIds: [4], // Customer role
        isActive: true,
        isEmailVerified: false,
      });

      // Auto-login after registration
      return this.login(user.email, userData.password);
    } catch (error) {
      if (error.message.includes('Email already exists')) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async refreshToken(userId: number): Promise<LoginResponse> {
    const user = await this.usersService.findOne(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Get user's current permissions
    const userWithPermissions = await this.userPermissionsService.getUserWithPermissions(user.id);
    const permissions = userWithPermissions?.getEffectivePermissions() || [];
    const roleNames = userWithPermissions?.roles?.map(role => role.name) || [];

    // Create new JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roleNames,
      permissions: permissions,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        roles: roleNames,
        permissions: permissions,
      },
    };
  }

  async getProfile(userId: number): Promise<{
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      phone?: string;
      companyName?: string;
      department?: string;
      isActive: boolean;
      isEmailVerified: boolean;
      lastLoginAt?: Date;
      createdAt: Date;
    };
    roles: string[];
    permissions: string[];
  }> {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userWithPermissions = await this.userPermissionsService.getUserWithPermissions(user.id);
    const permissions = userWithPermissions?.getEffectivePermissions() || [];
    const roleNames = userWithPermissions?.roles?.map(role => role.name) || [];

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        companyName: user.companyName,
        department: user.department,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      roles: roleNames,
      permissions: permissions,
    };
  }

  async verifyEmail(userId: number): Promise<void> {
    await this.usersService.markEmailAsVerified(userId);
  }
} 