import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
  BOTH = 'both',
}

export enum EstadoViaje {
  ACTIVO = 'disponible',
  OCUPADO = 'ocupado',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PASSENGER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: EstadoViaje,
    default: EstadoViaje.ACTIVO,
  })
  estado: EstadoViaje;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
