import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { RoomInventory } from '../hotels/entities/room-inventory.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      User,
      Hotel,
      RoomType,
      RoomInventory,
    ]),
    UsersModule,
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule {} 