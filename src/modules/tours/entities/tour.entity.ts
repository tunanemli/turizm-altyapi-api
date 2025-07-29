import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { TourCategory } from './tour-category.entity';
import { TourItinerary } from './tour-itinerary.entity';
import { TourPrice } from './tour-price.entity';
import { TourAvailability } from './tour-availability.entity';
import { TourImage } from './tour-image.entity';

export enum TourDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
  EXTREME = 'extreme'
}

export enum TourStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  shortDescription: string;

  @ManyToOne(() => TourCategory, category => category.tours)
  category: TourCategory;

  @Column('int')
  duration: number; // in days

  @Column('int')
  maxGroupSize: number;

  @Column('int')
  minGroupSize: number;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: TourDifficulty,
    default: TourDifficulty.EASY
  })
  difficulty: TourDifficulty;

  @Column({
    type: 'enum',
    enum: TourStatus,
    default: TourStatus.ACTIVE
  })
  status: TourStatus;

  @Column()
  startLocation: string;

  @Column()
  endLocation: string;

  @Column('json', { nullable: true })
  includedServices: string[];

  @Column('json', { nullable: true })
  excludedServices: string[];

  @Column('json', { nullable: true })
  requirements: string[];

  @Column('json', { nullable: true })
  highlights: string[];

  @Column('int', { default: 0 })
  rating: number; // Average rating * 10 (to avoid decimal issues)

  @Column('int', { default: 0 })
  reviewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TourItinerary, itinerary => itinerary.tour)
  itinerary: TourItinerary[];

  @OneToMany(() => TourPrice, price => price.tour)
  prices: TourPrice[];

  @OneToMany(() => TourAvailability, availability => availability.tour)
  availability: TourAvailability[];

  @OneToMany(() => TourImage, image => image.tour)
  images: TourImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}