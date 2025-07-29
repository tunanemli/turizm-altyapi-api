import { PartialType } from '@nestjs/swagger';
import { CreateHotelTypeDto } from './create-hotel-type.dto';

export class UpdateHotelTypeDto extends PartialType(CreateHotelTypeDto) {}