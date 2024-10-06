import { DataSource, DataSourceOptions } from 'typeorm';
import { Trip } from '../modules/trips/entities/trip.entity';
import { User } from './entities/user.entity';
import { Invoice } from '../modules/invoices/entities/invoice.entity';
import { Config } from './entities/config.entity';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Trip, Invoice, Config],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
export { dataSourceOptions };
