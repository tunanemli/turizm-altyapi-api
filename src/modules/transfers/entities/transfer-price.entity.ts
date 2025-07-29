import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transfer } from './transfer.entity';

@Entity('transfer_prices')
export class TransferPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transferId: number;

  @Column({ length: 100 })
  priceType: string; // 'per_person', 'per_vehicle', 'one_way', 'round_trip'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 3, default: 'TRY' })
  currency: string;

  @Column({ type: 'int', default: 1 })
  minPassengers: number;

  @Column({ type: 'int', nullable: true })
  maxPassengers: number;

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validTo: Date;

  @Column({ type: 'json', nullable: true })
  applicableDays: number[]; // [1,2,3,4,5] for weekdays

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Transfer, transfer => transfer.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transferId' })
  transfer: Transfer;
}