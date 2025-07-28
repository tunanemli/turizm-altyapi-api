import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional, IsObject, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestDetailDto {
  @ApiProperty({ description: 'Guest first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Guest last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Guest email' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Guest phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Guest nationality', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ description: 'Passport/ID number', required: false })
  @IsString()
  @IsOptional()
  idNumber?: string;
}

export class CreateReservationDto {
  @ApiProperty({ description: 'Hotel ID' })
  @IsNumber()
  hotelId: number;

  @ApiProperty({ description: 'Room type ID' })
  @IsNumber()
  roomTypeId: number;

  @ApiProperty({ description: 'Check-in date' })
  @IsDate()
  @Type(() => Date)
  checkInDate: Date;

  @ApiProperty({ description: 'Check-out date' })
  @IsDate()
  @Type(() => Date)
  checkOutDate: Date;

  @ApiProperty({ description: 'Number of adults', minimum: 1 })
  @IsNumber()
  @Min(1)
  adultCount: number;

  @ApiProperty({ description: 'Number of children', default: 0 })
  @IsNumber()
  @IsOptional()
  childCount?: number;

  @ApiProperty({ description: 'Number of rooms', minimum: 1 })
  @IsNumber()
  @Min(1)
  roomCount: number;

  @ApiProperty({ description: 'Guest details', type: [GuestDetailDto] })
  @IsArray()
  @Type(() => GuestDetailDto)
  guestDetails: GuestDetailDto[];

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ description: 'Customer ID', required: false })
  @IsNumber()
  @IsOptional()
  customerId?: number;
} 