import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsIn } from 'class-validator';

export class CreateHotelImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Image title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Image description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Image type',
    enum: ['main', 'gallery', 'exterior', 'interior', 'room', 'facility'],
    default: 'gallery'
  })
  @IsString()
  @IsIn(['main', 'gallery', 'exterior', 'interior', 'room', 'facility'])
  imageType: string;

  @ApiProperty({ description: 'Sort order', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Alt text for accessibility', required: false })
  @IsString()
  @IsOptional()
  altText?: string;
} 