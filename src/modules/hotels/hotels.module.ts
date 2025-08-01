import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { RoomPrice } from './entities/room-price.entity';
import { RoomInventory } from './entities/room-inventory.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { RoomImage } from './entities/room-image.entity';
import { Room } from './entities/room.entity';
import { HotelType } from './entities/hotel-type.entity';
import { HotelFeature } from './entities/hotel-feature.entity';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hotel, 
      RoomType, 
      RoomPrice, 
      RoomInventory, 
      HotelImage, 
      RoomImage,
      Room,
      HotelType,
      HotelFeature
    ]),
  ],
  providers: [HotelsService],
  controllers: [HotelsController],
  exports: [HotelsService],
})
export class HotelsModule {} 