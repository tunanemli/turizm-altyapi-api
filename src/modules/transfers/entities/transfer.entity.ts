import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TransferType } from './transfer-type.entity';
import { TransferRoute } from './transfer-route.entity';
import { TransferPrice } from './transfer-price.entity';
import { TransferSchedule } from './transfer-schedule.entity';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { Tour } from '../../tours/entities/tour.entity';

export enum TransferStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended'
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column()
  transferTypeId: number;

  @Column({ nullable: true })
  routeId: number;

  @Column({ nullable: true })
  fromHotelId: number;

  @Column({ nullable: true })
  toHotelId: number;

  @Column({ nullable: true })
  tourId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  maxPassengers: number;

  @Column({ type: 'int', default: 0 })
  minPassengers: number;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.ACTIVE
  })
  status: TransferStatus;

  @Column({ type: 'json', nullable: true })
  includedServices: string[]; // JSON array of included services

  @Column({ type: 'json', nullable: true })
  excludedServices: string[]; // JSON array of excluded services

  @Column({ type: 'text', nullable: true })
  pickupInstructions: string;

  @Column({ type: 'text', nullable: true })
  dropoffInstructions: string;

  @Column({ type: 'text', nullable: true })
  cancellationPolicy: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => TransferType, transferType => transferType.transfers, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transferTypeId' })
  transferType: TransferType;

  @ManyToOne(() => TransferRoute, route => route.transfers, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'routeId' })
  route: TransferRoute;

  @ManyToOne(() => Hotel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fromHotelId' })
  fromHotel: Hotel;

  @ManyToOne(() => Hotel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'toHotelId' })
  toHotel: Hotel;

  @ManyToOne(() => Tour, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tourId' })
  tour: Tour;

  @OneToMany(() => TransferPrice, price => price.transfer)
  prices: TransferPrice[];

  @OneToMany(() => TransferSchedule, schedule => schedule.transfer)
  schedules: TransferSchedule[];
}