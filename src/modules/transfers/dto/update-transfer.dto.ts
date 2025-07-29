import { PartialType } from '@nestjs/swagger';
import { CreateTransferDto } from './create-transfer.dto';
import { CreateTransferTypeDto } from './create-transfer-type.dto';
import { CreateTransferVehicleDto } from './create-transfer-vehicle.dto';

export class UpdateTransferDto extends PartialType(CreateTransferDto) {}

export class UpdateTransferTypeDto extends PartialType(CreateTransferTypeDto) {}

export class UpdateTransferVehicleDto extends PartialType(CreateTransferVehicleDto) {}