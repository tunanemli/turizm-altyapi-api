import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty({ description: 'Room type name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Room type description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Base occupancy' })
  @IsNumber()
  baseOccupancy: number;

  @ApiProperty({ description: 'Maximum occupancy' })
  @IsNumber()
  maxOccupancy: number;

  @ApiProperty({ description: 'Maximum adults' })
  @IsNumber()
  maxAdult: number;

  @ApiProperty({ description: 'Maximum children' })
  @IsNumber()
  maxChild: number;

  @ApiProperty({ description: 'Room size in square meters' })
  @IsNumber()
  roomSize: number;

  @ApiProperty({ description: 'Room size unit', default: 'sqm' })
  @IsString()
  roomSizeUnit: string;

  @ApiProperty({ description: 'Is smoking allowed', default: false })
  @IsBoolean()
  @IsOptional()
  isSmoking?: boolean;

  @ApiProperty({ description: 'Room facilities', type: 'object' })
  @IsObject()
  facilities: any;

  @ApiProperty({ description: 'Bed types configuration', type: 'object' })
  @IsObject()
  bedTypes: any;

  @ApiProperty({ description: 'Base price' })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ description: 'Currency code', default: 'TRY' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Extra bed policy', type: 'object' })
  @IsObject()
  extraBedPolicy: any;
} 