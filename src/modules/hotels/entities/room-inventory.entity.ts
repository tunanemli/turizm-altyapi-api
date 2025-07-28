import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { RoomType } from './room-type.entity';

@Entity('room_inventory')
export class RoomInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoomType, roomType => roomType.inventory)
  roomType: RoomType;

  @Column('date')
  date: Date;

  @Column('int')
  totalRooms: number;

  @Column('int')
  availableRooms: number;

  @Column('int', { default: 0 })
  blockedRooms: number;

  @Column({ nullable: true })
  blockReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 