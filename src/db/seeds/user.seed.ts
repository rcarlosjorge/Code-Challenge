import { DataSource } from 'typeorm';
import { User, UserRole, EstadoViaje } from '../entities/user.entity';

export class CreateUsers {
  public async run(dataSource: DataSource): Promise<void> {
    const existingUsers = await dataSource.getRepository(User).count();

    if (existingUsers > 0) {
      console.log('Seed data already exists, no new data will be added.');
      return;
    }

    const currentDate = new Date();

    await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        // Conductores
        {
          name: 'Juan Pérez',
          latitude: 18.4861,
          longitude: -69.9312,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'María García',
          latitude: 18.485,
          longitude: -69.93,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Luis Martínez',
          latitude: 18.4875,
          longitude: -69.932,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Ana Rodríguez',
          latitude: 18.488,
          longitude: -69.933,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Sofía Hernández',
          latitude: 18.489,
          longitude: -69.934,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Miguel Gómez',
          latitude: 18.483,
          longitude: -69.928,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Pedro Sánchez',
          latitude: 18.482,
          longitude: -69.927,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Isabel Ramírez',
          latitude: 18.491,
          longitude: -69.936,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        // Pasajeros
        {
          name: 'Carlos López',
          latitude: 18.4845,
          longitude: -69.9295,
          role: UserRole.PASSENGER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
        {
          name: 'Laura Díaz',
          latitude: 18.49,
          longitude: -69.935,
          role: UserRole.PASSENGER,
          estado: EstadoViaje.ACTIVO,
          created_at: currentDate,
          updated_at: currentDate,
        },
      ])
      .execute();

    console.log('Seed data has been inserted.');
  }
}
