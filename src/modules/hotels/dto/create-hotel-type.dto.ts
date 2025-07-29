import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHotelTypeDto {
  @ApiProperty({ description: 'Hotel type name', example: 'Bungalov' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Hotel type description', example: 'Doğa içinde müstakil bungalov tarzı konaklama' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Feature IDs for this hotel type', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  features?: number[];

  @ApiPropertyOptional({ description: 'Is hotel type active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}