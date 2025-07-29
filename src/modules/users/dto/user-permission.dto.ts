import { IsInt, IsBoolean, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GrantUserPermissionDto {
  @ApiProperty({ description: 'Permission ID', example: 1 })
  @IsInt()
  permissionId: number;

  @ApiPropertyOptional({ description: 'Expiration date', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Reason for granting permission', example: 'Temporary access for project' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RevokeUserPermissionDto {
  @ApiProperty({ description: 'Permission ID', example: 1 })
  @IsInt()
  permissionId: number;

  @ApiPropertyOptional({ description: 'Reason for revoking permission', example: 'Project completed' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkUserPermissionDto {
  @ApiProperty({ description: 'Permission IDs', example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];

  @ApiPropertyOptional({ description: 'Expiration date for all permissions', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Reason for granting permissions', example: 'Bulk permission grant' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'oldPassword123!' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password', example: 'newPassword123!' })
  @IsString()
  newPassword: string;
}

export class AdminChangePasswordDto {
  @ApiProperty({ description: 'New password', example: 'newPassword123!' })
  @IsString()
  newPassword: string;

  @ApiPropertyOptional({ description: 'Reason for password change', example: 'Password reset requested' })
  @IsOptional()
  @IsString()
  reason?: string;
}