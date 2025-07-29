import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferTypeDto {
  @ApiProperty({ description: 'Transfer type name', example: 'Havalimanı Transfer' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Transfer type description', example: 'Havalimanından otele transfer hizmeti' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon name', example: 'airplane' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({ description: 'Is transfer type active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}