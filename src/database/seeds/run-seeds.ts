import { AppDataSource } from '../datasource';
import { CreateUsers } from './user.seed';
import { CreateTrips } from './trip.seed';
import { SeedConfig } from './config.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const ConfigSeeder = new SeedConfig();
    await ConfigSeeder.run(AppDataSource);
    console.log('Config seeding completed!');

    const userSeeder = new CreateUsers();
    await userSeeder.run(AppDataSource);
    console.log('User seeding completed!');

    const tripSeeder = new CreateTrips();
    await tripSeeder.run(AppDataSource);
    console.log('Trip seeding completed!');

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error during Data Source initialization or seeding', err);
    process.exit(1);
  }
}

runSeeds();
