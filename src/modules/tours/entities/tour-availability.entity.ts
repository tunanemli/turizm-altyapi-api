import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Tour } from './tour.entity';

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  SOLD_OUT = 'sold_out',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

@Entity('tour_availability')
export class TourAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tour, tour => tour.availability, { onDelete: 'CASCADE' })
  tour: Tour;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('int')
  totalSpots: number;

  @Column('int')
  availableSpots: number;

  @Column('int', { default: 0 })
  reservedSpots: number;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE
  })
  status: AvailabilityStatus;

  @Column({ nullable: true })
  guideId: number; // Reference to tour guide

  @Column({ nullable: true })
  guideName: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  specialPrice: number; // Override price for this specific date

  @Column({ nullable: true })
  specialPriceCurrency: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}