import { PartialType } from '@nestjs/swagger';
import { CreateTourCategoryDto } from './create-tour-category.dto';

export class UpdateTourCategoryDto extends PartialType(CreateTourCategoryDto) {}