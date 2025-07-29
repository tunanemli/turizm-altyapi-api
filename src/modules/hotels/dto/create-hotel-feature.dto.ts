import { IsString, IsOptional, IsBoolean, IsInt, IsIn, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHotelFeatureDto {
  @ApiProperty({ description: 'Feature name', example: 'WiFi' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Feature description', example: 'Ücretsiz kablosuz internet' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Icon class', example: 'fas fa-wifi' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ 
    description: 'Feature category', 
    example: 'technology',
    enum: ['service', 'amenity', 'facility', 'technology', 'accessibility']
  })
  @IsOptional()
  @IsString()
  @IsIn(['service', 'amenity', 'facility', 'technology', 'accessibility'])
  category?: string;

  @ApiPropertyOptional({ description: 'Color for UI', example: '#4CAF50' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is feature active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}