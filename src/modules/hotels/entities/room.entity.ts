import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Hotel } from './hotel.entity';
import { RoomType } from './room-type.entity';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied', 
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
  OUT_OF_ORDER = 'out_of_order'
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomNumber: string;

  @Column({ nullable: true })
  roomCode: string;

  @Column('int', { nullable: true })
  floor: number;

  @ManyToOne(() => Hotel, hotel => hotel.rooms, { onDelete: 'CASCADE' })
  hotel: Hotel;

  @ManyToOne(() => RoomType, roomType => roomType.rooms, { onDelete: 'RESTRICT' })
  roomType: RoomType;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE
  })
  status: RoomStatus;

  @Column('date', { nullable: true })
  lastMaintenance: Date;

  @Column('date', { nullable: true })
  nextMaintenance: Date;

  @Column('text', { nullable: true })
  notes: string;

  @Column('json', { nullable: true })
  features: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}