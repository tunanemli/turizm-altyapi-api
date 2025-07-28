import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity('hotel_images')
export class HotelImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  imageType: string; // 'main', 'gallery', 'exterior', 'interior', 'room', 'facility'

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  altText: string;

  @ManyToOne(() => Hotel, hotel => hotel.images, { onDelete: 'CASCADE' })
  hotel: Hotel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 