import { IsString, IsOptional, IsInt, IsEnum, IsNumber, IsObject, IsDateString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, BookingPaymentStatus } from '../entities/transfer-booking.entity';

export class CreateTransferBookingDto {
  @ApiProperty({ description: 'Schedule ID', example: 1 })
  @IsInt()
  scheduleId: number;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  @IsInt()
  customerId: number;

  @ApiPropertyOptional({ description: 'Agent ID', example: 1 })
  @IsOptional()
  @IsInt()
  agentId?: number;

  @ApiProperty({ description: 'Passenger count', example: 2 })
  @IsInt()
  @Min(1)
  passengerCount: number;

  @ApiPropertyOptional({ 
    description: 'Passenger details', 
    example: {
      passengers: [
        { name: 'John Doe', age: 35, passport: 'A123456' },
        { name: 'Jane Doe', age: 32, passport: 'B789012' }
      ]
    }
  })
  @IsOptional()
  @IsObject()
  passengerDetails?: any;

  @ApiProperty({ description: 'Total price', example: 150.00 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiPropertyOptional({ description: 'Paid amount', example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ description: 'Currency', example: 'TRY' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Booking status', enum: BookingStatus, example: BookingStatus.PENDING })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Payment status', enum: BookingPaymentStatus, example: BookingPaymentStatus.UNPAID })
  @IsOptional()
  @IsEnum(BookingPaymentStatus)
  paymentStatus?: BookingPaymentStatus;

  @ApiPropertyOptional({ description: 'Payment due date', example: '2024-03-15T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  paymentDueDate?: string;

  @ApiPropertyOptional({ description: 'Pickup location', example: 'Antalya Havalimanı Terminal 1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pickupLocation?: string;

  @ApiPropertyOptional({ description: 'Dropoff location', example: 'Kemer Otel Adı' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  dropoffLocation?: string;

  @ApiPropertyOptional({ description: 'Special requests', example: 'Çocuk koltuğu gerekli' })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiPropertyOptional({ description: 'Booking notes', example: 'Müşteri özel talepleri' })
  @IsOptional()
  @IsString()
  notes?: string;
}