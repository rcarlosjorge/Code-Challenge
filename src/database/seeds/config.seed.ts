import { DataSource } from 'typeorm';
import { Config } from '../entities/config.entity';

export class SeedConfig {
  public async run(dataSource: DataSource): Promise<void> {
    const existingConfig = await dataSource.getRepository(Config).count();

    if (existingConfig > 0) {
      console.log('Seed data already exists, no new data will be added.');
      return;
    }

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Config)
      .values([
        {
          price_per_km: 25.0,
          service_fee_percentage: 0.1,
          tax_percentage: 0.18,
          distance_km: 3.0,
          number_of_drivers_to_return: 3,
        },
      ])
      .execute();

    console.log('Seed data for Config has been inserted.');
  }
}
