import { AppDataSource } from '../datasource';
import { CreateUsers } from './user.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const seeder = new CreateUsers();
    await seeder.run(AppDataSource);

    console.log('Seeding completed!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error during Data Source initialization or seeding', err);
    process.exit(1);
  }
}

runSeeds();