import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @OneToOne(() => Trip, (trip) => trip.invoice)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
