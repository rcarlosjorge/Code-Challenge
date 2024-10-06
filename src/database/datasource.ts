import { DataSource, DataSourceOptions } from 'typeorm';
import { Trip } from '../modules/trips/entities/trip.entity';
import { User } from './entities/user.entity';
import { Invoice } from '../modules/invoices/entities/invoice.entity';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER || 'taxi24_user',
  password: process.env.POSTGRES_PASSWORD || 'taxi24_password',
  database: process.env.POSTGRES_DB || 'taxi24',
  entities: [User, Trip, Invoice],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
export { dataSourceOptions };
