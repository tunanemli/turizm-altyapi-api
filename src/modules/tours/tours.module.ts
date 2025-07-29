import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourCategory } from './entities/tour-category.entity';
import { TourItinerary } from './entities/tour-itinerary.entity';
import { TourPrice } from './entities/tour-price.entity';
import { TourAvailability } from './entities/tour-availability.entity';
import { TourImage } from './entities/tour-image.entity';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tour,
      TourCategory,
      TourItinerary,
      TourPrice,
      TourAvailability,
      TourImage
    ]),
  ],
  providers: [ToursService],
  controllers: [ToursController],
  exports: [ToursService],
})
export class ToursModule {}