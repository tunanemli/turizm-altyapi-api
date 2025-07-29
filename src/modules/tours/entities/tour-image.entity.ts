import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_images')
export class TourImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  imageType: string; // 'main', 'gallery', 'itinerary', 'location', 'activity'

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  altText: string;

  @Column({ nullable: true })
  dayNumber: number; // Which day of itinerary this image belongs to

  @ManyToOne(() => Tour, tour => tour.images, { onDelete: 'CASCADE' })
  tour: Tour;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}