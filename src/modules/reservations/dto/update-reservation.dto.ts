import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateReservationDto {
  @ApiProperty({ 
    description: 'Reservation status',
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    required: false 
  })
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ description: 'Confirmation code', required: false })
  @IsString()
  @IsOptional()
  confirmationCode?: string;
}

export class CancelReservationDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  reason: string;
} 