import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete,
  Patch,
  UseGuards, 
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserPermissionsService } from './services/user-permissions.service';
import { User } from './entities/user.entity';
import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { 
  GrantUserPermissionDto, 
  RevokeUserPermissionDto, 
  BulkUserPermissionDto,
  ChangePasswordDto,
  AdminChangePasswordDto 
} from './dto/user-permission.dto';

@ApiTags('User Management')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userPermissionsService: UserPermissionsService,
  ) {}

  // ==================== USER CRUD OPERATIONS ====================

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  async findAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.usersService.findAll({
      page: page || 1,
      limit: limit || 10,
      search,
      role,
      isActive,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  async deactivateUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.usersService.deactivate(id);
    return { message: 'User deactivated successfully' };
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.usersService.activate(id);
    return { message: 'User activated successfully' };
  }

  // ==================== PASSWORD MANAGEMENT ====================

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password (by user)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Patch(':id/admin-change-password')
  @ApiOperation({ summary: 'Change user password (by admin)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async adminChangePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() adminChangePasswordDto: AdminChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.adminChangePassword(id, adminChangePasswordDto);
    return { message: 'Password changed successfully' };
  }

  // ==================== USER PERMISSIONS MANAGEMENT ====================

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions', type: [String] })
  async getUserPermissions(@Param('id', ParseIntPipe) id: number): Promise<{
    effectivePermissions: string[];
    rolePermissions: string[];
    userPermissions: UserPermission[];
  }> {
    const [effectivePermissions, user, userPermissions] = await Promise.all([
      this.userPermissionsService.getUserEffectivePermissions(id),
      this.userPermissionsService.getUserWithPermissions(id),
      this.userPermissionsService.getUserPermissions(id),
    ]);

    const rolePermissions = user?.roles?.flatMap(role => 
      role.getPermissionNames()
    ) || [];

    return {
      effectivePermissions,
      rolePermissions,
      userPermissions,
    };
  }

  @Post(':id/permissions/grant')
  @ApiOperation({ summary: 'Grant permission to user' })
  @ApiResponse({ status: 201, description: 'Permission granted successfully' })
  async grantPermission(
    @Param('id', ParseIntPipe) userId: number,
    @Body() grantDto: GrantUserPermissionDto,
    // TODO: Get grantedBy from JWT token
  ): Promise<UserPermission> {
    const grantedBy = 1; // TODO: Extract from JWT
    return this.userPermissionsService.grantPermissionToUser(
      userId,
      grantDto.permissionId,
      grantedBy,
      {
        expiresAt: grantDto.expiresAt ? new Date(grantDto.expiresAt) : undefined,
        reason: grantDto.reason,
      }
    );
  }

  @Post(':id/permissions/revoke')
  @ApiOperation({ summary: 'Revoke permission from user' })
  @ApiResponse({ status: 200, description: 'Permission revoked successfully' })
  async revokePermission(
    @Param('id', ParseIntPipe) userId: number,
    @Body() revokeDto: RevokeUserPermissionDto,
    // TODO: Get revokedBy from JWT token
  ): Promise<UserPermission> {
    const revokedBy = 1; // TODO: Extract from JWT
    return this.userPermissionsService.revokePermissionFromUser(
      userId,
      revokeDto.permissionId,
      revokedBy,
      revokeDto.reason
    );
  }

  @Post(':id/permissions/bulk-grant')
  @ApiOperation({ summary: 'Grant multiple permissions to user' })
  @ApiResponse({ status: 201, description: 'Permissions granted successfully' })
  async bulkGrantPermissions(
    @Param('id', ParseIntPipe) userId: number,
    @Body() bulkDto: BulkUserPermissionDto,
    // TODO: Get grantedBy from JWT token
  ): Promise<UserPermission[]> {
    const grantedBy = 1; // TODO: Extract from JWT
    return this.userPermissionsService.bulkGrantPermissionsToUser(
      userId,
      bulkDto.permissionIds,
      grantedBy,
      {
        expiresAt: bulkDto.expiresAt ? new Date(bulkDto.expiresAt) : undefined,
        reason: bulkDto.reason,
      }
    );
  }

  @Get(':id/permissions/history')
  @ApiOperation({ summary: 'Get user permission history' })
  @ApiResponse({ status: 200, description: 'User permission history' })
  async getUserPermissionHistory(@Param('id', ParseIntPipe) id: number): Promise<UserPermission[]> {
    return this.userPermissionsService.getUserPermissionHistory(id);
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove user permission (delete record)' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  @HttpCode(HttpStatus.OK)
  async removeUserPermission(
    @Param('id', ParseIntPipe) userId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<{ message: string }> {
    await this.userPermissionsService.removeUserPermission(userId, permissionId);
    return { message: 'Permission removed successfully' };
  }

  // ==================== PERMISSION UTILITIES ====================

  @Get('permissions/all')
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({ status: 200, description: 'All permissions', type: [Permission] })
  async getAllPermissions(): Promise<Permission[]> {
    return this.userPermissionsService.getAllPermissions();
  }

  @Get('permissions/by-module/:module')
  @ApiOperation({ summary: 'Get permissions by module' })
  @ApiResponse({ status: 200, description: 'Permissions by module', type: [Permission] })
  async getPermissionsByModule(@Param('module') module: string): Promise<Permission[]> {
    return this.userPermissionsService.getPermissionsByModule(module);
  }

  @Get('with-permission/:permission')
  @ApiOperation({ summary: 'Get users with specific permission' })
  @ApiResponse({ status: 200, description: 'Users with permission', type: [User] })
  async getUsersWithPermission(@Param('permission') permission: string): Promise<User[]> {
    return this.userPermissionsService.getUsersWithPermission(permission);
  }

  // ==================== USER ROLES MANAGEMENT ====================

  @Patch(':id/roles')
  @ApiOperation({ summary: 'Update user roles' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully' })
  async updateUserRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { roleIds: number[] },
  ): Promise<User> {
    return this.usersService.updateUserRoles(id, body.roleIds);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'User roles' })
  async getUserRoles(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const user = await this.usersService.findOne(id);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      roles: user.roles || [],
    };
  }
} 