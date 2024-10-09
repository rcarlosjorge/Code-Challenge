import {
  BadRequestException,
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
import { validateId } from '../../utils/validation/id-validation.util';
import { validateCoordinates } from '../../utils/validation/coordinate-validation.util';
import { getPaginationOptions } from '../../utils/pagination/pagination.util';

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

  async getActiveTrips(page: number = 1, limit: number = 10): Promise<Trip[]> {
    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const { page: currentPage, limit: currentLimit } = getPaginationOptions(
      page,
      limit,
    );

    const activeTrips = await this.tripsRepository.find({
      where: { estado: EstadoViaje.OCUPADO },
      relations: ['pasajero', 'conductor'],
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    });

    if (!activeTrips.length) {
      throw new NotFoundException('No hay viajes activos en este momento.');
    }

    return activeTrips;
  }

  async createTrip(createTripDto: CreateTripDto): Promise<Trip> {
    const pasajero = await this.findPassenger(createTripDto.pasajero_id);

    this.checkIfPassengerIsInTrip(pasajero);

    const {
      origen_latitud,
      origen_longitud,
      destino_latitud,
      destino_longitud,
    } = this.extractCoordinates(createTripDto, pasajero);

    const nearestDrivers = await this.passengersService.findNearestDrivers(
      origen_latitud,
      origen_longitud,
    );

    if (!nearestDrivers.length) {
      throw new NotFoundException('No hay conductores disponibles cerca.');
    }

    const conductor = this.getAvailableDriver(nearestDrivers);

    await this.updateDriverAndPassengerStatus(
      conductor,
      pasajero,
      EstadoViaje.OCUPADO,
    );

    const trip = this.tripsRepository.create({
      pasajero,
      conductor,
      estado: EstadoViaje.OCUPADO,
      origen_latitud,
      origen_longitud,
      destino_latitud,
      destino_longitud,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.tripsRepository.save(trip);
  }

  async completeTripAndGenerateInvoice(id: number): Promise<Buffer> {
    validateId(id);

    const trip = await this.tripsRepository.findOne({
      where: { id, estado: EstadoViaje.OCUPADO },
      relations: ['pasajero', 'conductor'],
    });

    if (!trip) {
      throw new NotFoundException(
        `El viaje con ID ${id} no fue encontrado o ya está completado.`,
      );
    }

    const existingInvoice = await this.invoicesService.findInvoiceByTripId(id);
    if (existingInvoice) {
      throw new ConflictException('Este viaje ya tiene una factura generada.');
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

  private async findPassenger(pasajero_id: number): Promise<User> {
    const pasajero = await this.usersRepository.findOne({
      where: { id: pasajero_id, role: UserRole.PASSENGER },
    });

    if (!pasajero) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    return pasajero;
  }

  private checkIfPassengerIsInTrip(pasajero: User): void {
    if (pasajero.estado === EstadoViaje.OCUPADO) {
      throw new ConflictException('El pasajero ya está en un viaje ocupado.');
    }
  }

  private extractCoordinates(createTripDto: CreateTripDto, pasajero: User) {
    const origen_latitud = createTripDto.origen_latitud ?? pasajero.latitude;
    const origen_longitud = createTripDto.origen_longitud ?? pasajero.longitude;
    validateCoordinates(origen_latitud, origen_longitud);

    const destino_latitud = createTripDto.destino_latitud;
    const destino_longitud = createTripDto.destino_longitud;
    validateCoordinates(destino_latitud, destino_longitud);

    return {
      origen_latitud,
      origen_longitud,
      destino_latitud,
      destino_longitud,
    };
  }

  private getAvailableDriver(drivers: User[]): User {
    const availableDrivers = drivers.filter(
      (driver) => driver.estado !== EstadoViaje.OCUPADO,
    );

    if (!availableDrivers.length) {
      throw new ConflictException('No hay conductores disponibles.');
    }

    return availableDrivers[0];
  }

  private async updateDriverAndPassengerStatus(
    conductor: User,
    pasajero: User,
    estado: EstadoViaje,
  ): Promise<void> {
    conductor.estado = estado;
    pasajero.estado = estado;

    await this.usersRepository.save([conductor, pasajero]);
  }
}
