import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transfer } from './transfer.entity';

@Entity('transfer_routes')
export class TransferRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  fromLocation: string;

  @Column({ length: 255 })
  toLocation: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  fromLatitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  fromLongitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  toLatitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  toLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: number; // in kilometers

  @Column({ type: 'int' })
  estimatedDuration: number; // in minutes

  @Column({ type: 'json', nullable: true })
  waypoints: any[]; // JSON array of intermediate stops

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Transfer, transfer => transfer.route)
  transfers: Transfer[];
}