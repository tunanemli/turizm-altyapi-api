import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoomType } from './room-type.entity';
import { HotelImage } from './hotel-image.entity';
import { Room } from './room.entity';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  chainName: string;

  @Column({ nullable: true })
  brandName: string;

  @Column()
  description: string;

  @Column('int')
  starRating: number;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  checkInTime: string;

  @Column()
  checkOutTime: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column('json')
  facilities: any;

  @Column('json')
  policies: any;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RoomType, roomType => roomType.hotel)
  roomTypes: RoomType[];

  @OneToMany(() => Room, room => room.hotel)
  rooms: Room[];

  @OneToMany(() => HotelImage, image => image.hotel)
  images: HotelImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 