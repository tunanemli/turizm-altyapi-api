import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Transfer } from './transfer.entity';
import { TransferVehicle } from './transfer-vehicle.entity';
import { TransferBooking } from './transfer-booking.entity';

@Entity('transfer_schedules')
export class TransferSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transferId: number;

  @Column()
  vehicleId: number;

  @Column({ type: 'date' })
  scheduleDate: Date;

  @Column({ type: 'time' })
  departureTime: string;

  @Column({ type: 'time', nullable: true })
  arrivalTime: string;

  @Column({ type: 'int' })
  availableSeats: number;

  @Column({ type: 'int', default: 0 })
  bookedSeats: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  specialPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Transfer, transfer => transfer.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transferId' })
  transfer: Transfer;

  @ManyToOne(() => TransferVehicle, vehicle => vehicle.schedules, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: TransferVehicle;

  @OneToMany(() => TransferBooking, booking => booking.schedule)
  bookings: TransferBooking[];

  // Helper methods
  get remainingSeats(): number {
    return this.availableSeats - this.bookedSeats;
  }

  get isFullyBooked(): boolean {
    return this.bookedSeats >= this.availableSeats;
  }
}