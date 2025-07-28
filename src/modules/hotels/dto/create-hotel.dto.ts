import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, IsEmail, Min, Max } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ description: 'Hotel name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hotel chain name', required: false })
  @IsString()
  @IsOptional()
  chainName?: string;

  @ApiProperty({ description: 'Hotel brand name', required: false })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiProperty({ description: 'Hotel description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Star rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  starRating: number;

  @ApiProperty({ description: 'Hotel email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Hotel phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Hotel website', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Check-in time', example: '14:00' })
  @IsString()
  checkInTime: string;

  @ApiProperty({ description: 'Check-out time', example: '12:00' })
  @IsString()
  checkOutTime: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Full address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Hotel facilities', type: 'object' })
  @IsObject()
  facilities: any;

  @ApiProperty({ description: 'Hotel policies', type: 'object' })
  @IsObject()
  policies: any;
} 