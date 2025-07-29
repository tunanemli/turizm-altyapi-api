import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferType } from './entities/transfer-type.entity';
import { TransferVehicle } from './entities/transfer-vehicle.entity';
import { TransferRoute } from './entities/transfer-route.entity';
import { Transfer } from './entities/transfer.entity';
import { TransferPrice } from './entities/transfer-price.entity';
import { TransferSchedule } from './entities/transfer-schedule.entity';
import { TransferBooking } from './entities/transfer-booking.entity';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransferType,
      TransferVehicle,
      TransferRoute,
      Transfer,
      TransferPrice,
      TransferSchedule,
      TransferBooking,
    ])
  ],
  providers: [TransfersService],
  controllers: [TransfersController],
  exports: [TransfersService],
})
export class TransfersModule {}