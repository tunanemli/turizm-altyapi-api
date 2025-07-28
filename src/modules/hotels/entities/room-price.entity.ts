import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { RoomType } from './room-type.entity';

@Entity('room_prices')
export class RoomPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomType, roomType => roomType.prices)
  roomType: RoomType;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column()
  ratePlan: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  currency: string;

  @Column('json')
  mealPlan: any;

  @Column('json')
  cancellationPolicy: any;

  @Column('boolean', { default: true })
  isRefundable: boolean;

  @Column('int', { default: 1 })
  minStay: number;

  @Column('int', { nullable: true })
  maxStay: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 