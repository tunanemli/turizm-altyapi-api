import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHotelTypeDto {
  @ApiProperty({ description: 'Hotel type name', example: 'Bungalov' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Hotel type description', example: 'Doğa içinde müstakil bungalov tarzı konaklama' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Icon for the hotel type', example: 'fas fa-tree' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Color for the hotel type', example: '#4CAF50' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Features of this hotel type', example: ['Doğa Manzarası', 'Özel Bahçe', 'Şömine'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is hotel type active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}