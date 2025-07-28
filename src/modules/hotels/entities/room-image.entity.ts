import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { RoomType } from './room-type.entity';

@Entity('room_images')
export class RoomImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  imageType: string; // 'main', 'bedroom', 'bathroom', 'view', 'amenity'

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  altText: string;

  @ManyToOne(() => RoomType, roomType => roomType.images, { onDelete: 'CASCADE' })
  roomType: RoomType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 