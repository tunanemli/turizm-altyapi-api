import { PartialType } from '@nestjs/swagger';
import { CreateHotelFeatureDto } from './create-hotel-feature.dto';

export class UpdateHotelFeatureDto extends PartialType(CreateHotelFeatureDto) {}