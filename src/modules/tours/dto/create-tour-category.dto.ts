import { IsString, IsOptional, IsBoolean, IsInt, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTourCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Kültür Turu' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Category description', example: 'Tarihi ve kültürel yerleri ziyaret eden turlar' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Icon for the category', example: 'fas fa-landmark' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Color for the category', example: '#FF6B6B' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is category active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}