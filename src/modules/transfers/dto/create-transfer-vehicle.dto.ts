import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsArray, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferVehicleType } from '../entities/transfer-vehicle.entity';

export class CreateTransferVehicleDto {
  @ApiProperty({ description: 'Vehicle name', example: 'Mercedes Sprinter' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Vehicle type', enum: TransferVehicleType, example: TransferVehicleType.MINIBUS })
  @IsEnum(TransferVehicleType)
  vehicleType: TransferVehicleType;

  @ApiProperty({ description: 'Vehicle capacity', example: 14 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ description: 'Vehicle plate number', example: '34 ABC 123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  plateNumber?: string;

  @ApiPropertyOptional({ description: 'Vehicle description', example: 'Lüks klimalı araç' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Vehicle features', example: ['klima', 'wifi', 'usb_sarj'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Price per kilometer', example: 5.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerKm?: number;

  @ApiPropertyOptional({ description: 'Is vehicle active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}