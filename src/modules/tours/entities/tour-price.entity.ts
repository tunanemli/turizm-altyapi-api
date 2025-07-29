import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Tour } from './tour.entity';

export enum PriceType {
  ADULT = 'adult',
  CHILD = 'child',
  INFANT = 'infant',
  SENIOR = 'senior',
  STUDENT = 'student',
  GROUP = 'group'
}

@Entity('tour_prices')
export class TourPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tour, tour => tour.prices, { onDelete: 'CASCADE' })
  tour: Tour;

  @Column({
    type: 'enum',
    enum: PriceType,
    default: PriceType.ADULT
  })
  priceType: PriceType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  currency: string;

  @Column('date')
  validFrom: Date;

  @Column('date')
  validTo: Date;

  @Column('int', { nullable: true })
  minGroupSize: number;

  @Column('int', { nullable: true })
  maxGroupSize: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discountPercentage: number;

  @Column({ nullable: true })
  seasonName: string; // High Season, Low Season, Peak Season, etc.

  @Column('json', { nullable: true })
  conditions: string[]; // Special conditions for this price

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}