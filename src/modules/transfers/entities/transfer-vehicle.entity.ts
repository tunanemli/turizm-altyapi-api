import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TransferSchedule } from './transfer-schedule.entity';

export enum TransferVehicleType {
  SEDAN = 'sedan',
  MINIBUS = 'minibus',
  BUS = 'bus',
  VIP = 'vip',
  LUXURY = 'luxury'
}

@Entity('transfer_vehicles')
export class TransferVehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: TransferVehicleType,
    default: TransferVehicleType.SEDAN
  })
  vehicleType: TransferVehicleType;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ length: 100, nullable: true })
  plateNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  features: string[]; // JSON array of features like ['klima', 'wifi', 'usb_sarj']

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerKm: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => TransferSchedule, schedule => schedule.vehicle)
  schedules: TransferSchedule[];
}