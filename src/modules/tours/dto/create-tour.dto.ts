import { IsString, IsOptional, IsInt, IsEnum, IsDecimal, IsArray, IsBoolean, Length, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TourDifficulty, TourStatus } from '../entities/tour.entity';

export class CreateTourDto {
  @ApiProperty({ description: 'Tour name', example: 'İstanbul Tarihi Yarımada Turu' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Detailed tour description', example: 'Sultanahmet, Ayasofya, Topkapı Sarayı...' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Short description', example: 'İstanbul\'un tarihi güzelliklerini keşfedin' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Category ID', example: 1 })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: 'Tour duration in days', example: 3 })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Maximum group size', example: 25 })
  @IsInt()
  @Min(1)
  maxGroupSize: number;

  @ApiProperty({ description: 'Minimum group size', example: 4 })
  @IsInt()
  @Min(1)
  minGroupSize: number;

  @ApiProperty({ description: 'Base price', example: 1500.00 })
  @IsDecimal({ decimal_digits: '0,2' })
  @Type(() => Number)
  basePrice: number;

  @ApiProperty({ description: 'Currency', example: 'TRY' })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiPropertyOptional({ description: 'Tour difficulty', enum: TourDifficulty, example: TourDifficulty.EASY })
  @IsOptional()
  @IsEnum(TourDifficulty)
  difficulty?: TourDifficulty;

  @ApiPropertyOptional({ description: 'Tour status', enum: TourStatus, example: TourStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TourStatus)
  status?: TourStatus;

  @ApiProperty({ description: 'Start location', example: 'İstanbul Havalimanı' })
  @IsString()
  @Length(1, 255)
  startLocation: string;

  @ApiProperty({ description: 'End location', example: 'İstanbul Havalimanı' })
  @IsString()
  @Length(1, 255)
  endLocation: string;

  @ApiPropertyOptional({ description: 'Included services', example: ['Rehber', 'Ulaşım', 'Müze girişleri'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedServices?: string[];

  @ApiPropertyOptional({ description: 'Excluded services', example: ['Yemekler', 'Konaklama'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedServices?: string[];

  @ApiPropertyOptional({ description: 'Tour requirements', example: ['Rahat ayakkabı', 'Su şişesi'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ description: 'Tour highlights', example: ['Ayasofya ziyareti', 'Boğaz turu'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @ApiPropertyOptional({ description: 'Is tour active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}