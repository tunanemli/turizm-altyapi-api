import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_itinerary')
export class TourItinerary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tour, tour => tour.itinerary, { onDelete: 'CASCADE' })
  tour: Tour;

  @Column('int')
  dayNumber: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  activities: string;

  @Column({ nullable: true })
  accommodation: string;

  @Column({ nullable: true })
  meals: string;

  @Column({ nullable: true })
  transportation: string;

  @Column('time', { nullable: true })
  startTime: string;

  @Column('time', { nullable: true })
  endTime: string;

  @Column('json', { nullable: true })
  locations: any; // {name: string, latitude: number, longitude: number}[]

  @Column('json', { nullable: true })
  notes: string[];

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}