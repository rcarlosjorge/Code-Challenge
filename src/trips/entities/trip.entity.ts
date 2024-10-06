import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User, EstadoViaje } from '../../db/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'pasajero_id' })
  pasajero: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'conductor_id' })
  conductor: User;

  @Column({
    type: 'enum',
    enum: EstadoViaje,
    default: EstadoViaje.ACTIVO,
  })
  estado: EstadoViaje;

  @Column('decimal', { precision: 9, scale: 6 })
  origen_latitud: number;

  @Column('decimal', { precision: 9, scale: 6 })
  origen_longitud: number;

  @Column('decimal', { precision: 9, scale: 6 })
  destino_latitud: number;

  @Column('decimal', { precision: 9, scale: 6 })
  destino_longitud: number;

  @OneToOne(() => Invoice, (invoice) => invoice.trip)
  invoice: Invoice;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
