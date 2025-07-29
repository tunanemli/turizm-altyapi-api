import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Hotel } from './hotel.entity';
import { RoomPrice } from './room-price.entity';
import { RoomInventory } from './room-inventory.entity';
import { RoomImage } from './room-image.entity';
import { Room } from './room.entity';

@Entity('room_types')
export class RoomType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('int')
  baseOccupancy: number;

  @Column('int')
  maxOccupancy: number;

  @Column('int')
  maxAdult: number;

  @Column('int')
  maxChild: number;

  @Column('int')
  roomSize: number;

  @Column()
  roomSizeUnit: string;

  @Column('boolean', { default: false })
  isSmoking: boolean;

  @Column('json')
  facilities: any;

  @Column('json')
  bedTypes: any;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column()
  currency: string;

  @Column('json')
  extraBedPolicy: any;

  @ManyToOne(() => Hotel, hotel => hotel.roomTypes)
  hotel: Hotel;

  @OneToMany(() => RoomPrice, roomPrice => roomPrice.roomType)
  prices: RoomPrice[];

  @OneToMany(() => RoomInventory, inventory => inventory.roomType)
  inventory: RoomInventory[];

  @OneToMany(() => Room, room => room.roomType)
  rooms: Room[];

  @OneToMany(() => RoomImage, image => image.roomType)
  images: RoomImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 