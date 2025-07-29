import { IsString, IsOptional, IsInt, IsEnum, IsArray, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatus } from '../entities/transfer.entity';

export class CreateTransferDto {
  @ApiProperty({ description: 'Transfer name', example: 'Antalya Havalimanı - Kemer Transfer' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Transfer type ID', example: 1 })
  @IsInt()
  transferTypeId: number;

  @ApiPropertyOptional({ description: 'Route ID', example: 1 })
  @IsOptional()
  @IsInt()
  routeId?: number;

  @ApiPropertyOptional({ description: 'From hotel ID', example: 1 })
  @IsOptional()
  @IsInt()
  fromHotelId?: number;

  @ApiPropertyOptional({ description: 'To hotel ID', example: 2 })
  @IsOptional()
  @IsInt()
  toHotelId?: number;

  @ApiPropertyOptional({ description: 'Tour ID', example: 1 })
  @IsOptional()
  @IsInt()
  tourId?: number;

  @ApiPropertyOptional({ description: 'Transfer description', example: 'Konforlu havalimanı transfer hizmeti' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Maximum passengers', example: 14 })
  @IsInt()
  @Min(1)
  maxPassengers: number;

  @ApiPropertyOptional({ description: 'Minimum passengers', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPassengers?: number;

  @ApiPropertyOptional({ description: 'Transfer status', enum: TransferStatus, example: TransferStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiPropertyOptional({ description: 'Included services', example: ['bagaj_tasima', 'meet_greet'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedServices?: string[];

  @ApiPropertyOptional({ description: 'Excluded services', example: ['yemek', 'otel_ici_transfer'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedServices?: string[];

  @ApiPropertyOptional({ description: 'Pickup instructions', example: 'Terminal 1 çıkış kapısında bekleyiniz' })
  @IsOptional()
  @IsString()
  pickupInstructions?: string;

  @ApiPropertyOptional({ description: 'Dropoff instructions', example: 'Otel resepsiyonuna bırakılacaktır' })
  @IsOptional()
  @IsString()
  dropoffInstructions?: string;

  @ApiPropertyOptional({ description: 'Cancellation policy', example: '24 saat öncesine kadar ücretsiz iptal' })
  @IsOptional()
  @IsString()
  cancellationPolicy?: string;
}