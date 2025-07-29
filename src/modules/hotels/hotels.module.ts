import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { RoomPrice } from './entities/room-price.entity';
import { RoomInventory } from './entities/room-inventory.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { RoomImage } from './entities/room-image.entity';
import { Room } from './entities/room.entity';
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
      Room
    ]),
  ],
  providers: [HotelsService],
  controllers: [HotelsController],
  exports: [HotelsService],
})
export class HotelsModule {} 