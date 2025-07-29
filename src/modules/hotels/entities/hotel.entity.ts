import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { RoomType } from './room-type.entity';
import { HotelImage } from './hotel-image.entity';
import { Room } from './room.entity';
import { HotelType } from './hotel-type.entity';
import { HotelFeature } from './hotel-feature.entity';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'int', default: 1 })
  starRating: number;

  @Column({ type: 'json', nullable: true })
  features: number[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Room, room => room.hotel)
  rooms: Room[];

  @ManyToOne(() => HotelType, hotelType => hotelType.hotels)
  hotelType: HotelType;

  @OneToMany(() => RoomType, roomType => roomType.hotel)
  roomTypes: RoomType[];

  @OneToMany(() => HotelImage, hotelImage => hotelImage.hotel)
  images: HotelImage[];
} 