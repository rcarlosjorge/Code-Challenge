import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import {
  User,
  UserRole,
  EstadoViaje,
} from '../../database/entities/user.entity';
import { PassengersService } from '../passengers/passengers.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private passengersService: PassengersService,
    private invoicesService: InvoicesService,
  ) {}

  async getActiveTrips(): Promise<Trip[]> {
    return this.tripsRepository.find({
      where: {
        estado: EstadoViaje.OCUPADO,
      },
      relations: ['pasajero', 'conductor'],
    });
  }

  async createTrip(createTripDto: CreateTripDto): Promise<Trip> {
    const pasajero = await this.usersRepository.findOne({
      where: { id: createTripDto.pasajero_id, role: UserRole.PASSENGER },
    });

    if (!pasajero) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    if (pasajero.estado === EstadoViaje.OCUPADO) {
      throw new ConflictException('El pasajero ya está en un viaje ocupado.');
    }

    const nearestDrivers = await this.passengersService.findNearestDrivers(
      createTripDto.origen_latitud,
      createTripDto.origen_longitud,
    );

    if (nearestDrivers.length === 0) {
      throw new NotFoundException('No hay conductores disponibles cerca.');
    }

    const availableDrivers = nearestDrivers.filter(
      (driver) => driver.estado !== EstadoViaje.OCUPADO,
    );

    if (availableDrivers.length === 0) {
      throw new ConflictException('No hay conductores disponibles.');
    }

    const conductor = availableDrivers[0];

    conductor.estado = EstadoViaje.OCUPADO;
    await this.usersRepository.save(conductor);

    pasajero.estado = EstadoViaje.OCUPADO;
    await this.usersRepository.save(pasajero);

    const trip = this.tripsRepository.create({
      pasajero,
      conductor,
      estado: EstadoViaje.OCUPADO,
      origen_latitud: createTripDto.origen_latitud,
      origen_longitud: createTripDto.origen_longitud,
      destino_latitud: createTripDto.destino_latitud,
      destino_longitud: createTripDto.destino_longitud,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.tripsRepository.save(trip);
  }

  async completeTripAndGenerateInvoice(id: number): Promise<Buffer> {
    const trip = await this.tripsRepository.findOne({
      where: { id, estado: EstadoViaje.OCUPADO },
      relations: ['pasajero', 'conductor'],
    });

    if (!trip) {
      throw new NotFoundException(
        `El viaje con ID ${id} no fue encontrado o ya está completado.`,
      );
    }

    trip.estado = EstadoViaje.COMPLETADO;
    trip.updated_at = new Date();
    await this.tripsRepository.save(trip);

    trip.pasajero.estado = EstadoViaje.ACTIVO;
    trip.conductor.estado = EstadoViaje.ACTIVO;
    await this.usersRepository.save([trip.pasajero, trip.conductor]);

    const invoice = await this.invoicesService.createInvoice(trip);
    return this.invoicesService.generateInvoicePdf(invoice.id);
  }
}
