import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransferSchedule } from './transfer-schedule.entity';
import { User } from '../../users/entities/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export enum BookingPaymentStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  FULLY_PAID = 'fully_paid',
  REFUNDED = 'refunded'
}

@Entity('transfer_bookings')
export class TransferBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  scheduleId: number;

  @Column()
  customerId: number;

  @Column({ nullable: true })
  agentId: number;

  @Column({ length: 100, unique: true })
  bookingReference: string;

  @Column({ type: 'int' })
  passengerCount: number;

  @Column({ type: 'json', nullable: true })
  passengerDetails: any; // JSON object with passenger information

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ length: 3, default: 'TRY' })
  currency: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @Column({
    type: 'enum',
    enum: BookingPaymentStatus,
    default: BookingPaymentStatus.UNPAID
  })
  paymentStatus: BookingPaymentStatus;

  @Column({ type: 'datetime', nullable: true })
  paymentDueDate: Date;

  @Column({ length: 255, nullable: true })
  pickupLocation: string;

  @Column({ length: 255, nullable: true })
  dropoffLocation: string;

  @Column({ type: 'text', nullable: true })
  specialRequests: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => TransferSchedule, schedule => schedule.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'scheduleId' })
  schedule: TransferSchedule;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  // Helper methods
  get remainingAmount(): number {
    return this.totalPrice - this.paidAmount;
  }

  get isFullyPaid(): boolean {
    return this.paidAmount >= this.totalPrice;
  }

  get canBeCancelled(): boolean {
    return this.status === BookingStatus.PENDING || this.status === BookingStatus.CONFIRMED;
  }
}