import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { RoomType } from '../../hotels/entities/room-type.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  reservationNumber: string;

  @Column('date')
  checkInDate: Date;

  @Column('date')
  checkOutDate: Date;

  @Column('int')
  nights: number;

  @Column('int')
  adultCount: number;

  @Column('int', { default: 0 })
  childCount: number;

  @Column('int')
  roomCount: number;

  @Column('json')
  guestDetails: any; // Misafir bilgileri

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column()
  currency: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  @Column()
  status: string; // 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'

  @Column()
  paymentStatus: string; // 'pending', 'partial', 'paid', 'refunded'

  @Column({ nullable: true })
  specialRequests: string;

  @Column('json')
  cancellationPolicy: any;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  confirmationCode: string;

  @ManyToOne(() => User, { nullable: false })
  customer: User;

  @ManyToOne(() => User, { nullable: true })
  agent: User; // Rezervasyonu yapan acente

  @ManyToOne(() => Hotel, { nullable: false })
  hotel: Hotel;

  @ManyToOne(() => RoomType, { nullable: false })
  roomType: RoomType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get isActive(): boolean {
    return ['pending', 'confirmed'].includes(this.status);
  }

  get canBeCancelled(): boolean {
    const now = new Date();
    const checkIn = new Date(this.checkInDate);
    const hoursDifference = (checkIn.getTime() - now.getTime()) / (1000 * 3600);
    
    // Cancellation policy'den saatlere göre kontrol
    return hoursDifference > 24 && this.isActive;
  }
} 