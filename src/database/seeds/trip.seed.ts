import { AppDataSource } from '../datasource';
import { DataSource } from 'typeorm';
import { Trip } from '../../modules/trips/entities/trip.entity';
import { User, UserRole, EstadoViaje } from '../entities/user.entity';

export class CreateTrips {
  public async run(dataSource: DataSource): Promise<void> {
    const tripRepository = AppDataSource.getRepository(Trip);
    const userRepository = AppDataSource.getRepository(User);

    const existingTrips = await tripRepository.count();
    if (existingTrips > 0) {
      console.log('Trip seed data already exists, no new data will be added.');
      return;
    }

    const currentDate = new Date();

    const drivers = await userRepository.find({
      where: { role: UserRole.DRIVER },
      take: 2,
    });

    const passengers = await userRepository.find({
      where: { role: UserRole.PASSENGER },
      take: 5,
    });

    if (drivers.length < 2 || passengers.length < 5) {
      console.log('Not enough drivers or passengers for seeding.');
      return;
    }

    // Conductores ocupados
    const trips = [
      {
        pasajero: passengers[0],
        conductor: drivers[0],
        estado: EstadoViaje.OCUPADO,
        origen_latitud: passengers[0].latitude,
        origen_longitud: passengers[0].longitude,
        destino_latitud: 18.501,
        destino_longitud: -69.942,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        pasajero: passengers[1],
        conductor: drivers[1],
        estado: EstadoViaje.OCUPADO,
        origen_latitud: passengers[1].latitude,
        origen_longitud: passengers[1].longitude,
        destino_latitud: 18.503,
        destino_longitud: -69.943,
        created_at: currentDate,
        updated_at: currentDate,
      },
    ];

    drivers[0].estado = EstadoViaje.OCUPADO;
    drivers[1].estado = EstadoViaje.OCUPADO;
    passengers[0].estado = EstadoViaje.OCUPADO;
    passengers[1].estado = EstadoViaje.OCUPADO;

    await userRepository.save([...drivers, passengers[0], passengers[1]]);
    await tripRepository.save(trips);

    // Viajes finalizados
    const completedTrips = [
      {
        pasajero: passengers[2],
        conductor: drivers[0],
        estado: EstadoViaje.COMPLETADO,
        origen_latitud: passengers[2].latitude,
        origen_longitud: passengers[2].longitude,
        destino_latitud: 18.504,
        destino_longitud: -69.944,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        pasajero: passengers[3],
        conductor: drivers[1],
        estado: EstadoViaje.COMPLETADO,
        origen_latitud: passengers[3].latitude,
        origen_longitud: passengers[3].longitude,
        destino_latitud: 18.505,
        destino_longitud: -69.945,
        created_at: currentDate,
        updated_at: currentDate,
      },
      {
        pasajero: passengers[4],
        conductor: drivers[1],
        estado: EstadoViaje.COMPLETADO,
        origen_latitud: passengers[4].latitude,
        origen_longitud: passengers[4].longitude,
        destino_latitud: 18.506,
        destino_longitud: -69.946,
        created_at: currentDate,
        updated_at: currentDate,
      },
    ];

    await tripRepository.save(completedTrips);

    console.log('Trip seed data has been inserted.');
  }
}
