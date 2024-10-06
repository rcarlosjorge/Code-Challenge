import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('config')
export class Config {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price_per_km: number;

  @Column('decimal', { precision: 10, scale: 2 })
  service_fee_percentage: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax_percentage: number;

  @Column('decimal', { precision: 10, scale: 2 })
  distance_km: number;

  @Column('int')
  number_of_drivers_to_return: number;
}
