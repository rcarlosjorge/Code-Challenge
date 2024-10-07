import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { Repository } from 'typeorm';
import { PassengersService } from '../passengers/passengers.service';
import { InvoicesService } from '../invoices/invoices.service';
import { EstadoViaje } from '../../database/entities/user.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TripsService', () => {
  let service: TripsService;
  let tripsRepository: Repository<Trip>;
  let usersRepository: Repository<User>;

  const mockTripsRepository = {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPassengersService = {
    findNearestDrivers: jest.fn(),
  };

  const mockInvoicesService = {
    createInvoice: jest.fn(),
    generateInvoicePdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: getRepositoryToken(Trip), useValue: mockTripsRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: PassengersService, useValue: mockPassengersService },
        { provide: InvoicesService, useValue: mockInvoicesService },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    tripsRepository = module.get<Repository<Trip>>(getRepositoryToken(Trip));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all active trips', async () => {
    const trips: Trip[] = [
      {
        id: 1,
        estado: EstadoViaje.OCUPADO,
        origen_latitud: 18.464601,
        origen_longitud: -69.932553,
        destino_latitud: 18.485,
        destino_longitud: -69.9295,
        created_at: new Date(),
        updated_at: new Date(),
        pasajero: new User(),
        conductor: new User(),
        invoice: new Invoice(),
      },
      {
        id: 2,
        estado: EstadoViaje.OCUPADO,
        origen_latitud: 18.4875,
        origen_longitud: -69.932,
        destino_latitud: 18.49,
        destino_longitud: -69.935,
        created_at: new Date(),
        updated_at: new Date(),
        pasajero: new User(),
        conductor: new User(),
        invoice: new Invoice(),
      },
    ];

    jest.spyOn(tripsRepository, 'find').mockResolvedValue(trips);

    const result = await service.getActiveTrips();
    expect(result).toEqual(trips);
    expect(tripsRepository.find).toHaveBeenCalledWith({
      where: {
        estado: EstadoViaje.OCUPADO,
      },
      relations: ['pasajero', 'conductor'],
    });
  });

  describe('createTrip', () => {
    it('should create and save a new trip', async () => {
      const createTripDto = {
        pasajero_id: 1,
        destino_latitud: 18.485,
        destino_longitud: -69.9295,
      };

      const pasajero = {
        id: 1,
        role: UserRole.PASSENGER,
        estado: EstadoViaje.ACTIVO,
        latitude: 18.464601,
        longitude: -69.932553,
      } as User;
      const conductor = {
        id: 2,
        role: UserRole.DRIVER,
        estado: EstadoViaje.ACTIVO,
      } as User;
      const trip = {
        id: 1,
        estado: EstadoViaje.OCUPADO,
        origen_latitud: pasajero.latitude,
        origen_longitud: pasajero.longitude,
        destino_latitud: createTripDto.destino_latitud,
        destino_longitud: createTripDto.destino_longitud,
        created_at: new Date(),
        updated_at: new Date(),
        pasajero,
        conductor,
      } as Trip;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(pasajero);
      jest
        .spyOn(mockPassengersService, 'findNearestDrivers')
        .mockResolvedValue([conductor]);
      jest.spyOn(tripsRepository, 'create').mockReturnValue(trip);
      jest.spyOn(tripsRepository, 'save').mockResolvedValue(trip);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(conductor);

      const result = await service.createTrip(createTripDto);
      expect(result).toEqual(trip);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTripDto.pasajero_id, role: UserRole.PASSENGER },
      });
      expect(mockPassengersService.findNearestDrivers).toHaveBeenCalledWith(
        pasajero.latitude,
        pasajero.longitude,
      );
      expect(tripsRepository.create).toHaveBeenCalledWith({
        pasajero,
        conductor,
        estado: EstadoViaje.OCUPADO,
        origen_latitud: pasajero.latitude,
        origen_longitud: pasajero.longitude,
        destino_latitud: createTripDto.destino_latitud,
        destino_longitud: createTripDto.destino_longitud,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(tripsRepository.save).toHaveBeenCalledWith(trip);
      expect(usersRepository.save).toHaveBeenCalledWith(conductor);
    });

    it('should throw NotFoundException if passenger is not found', async () => {
      const createTripDto = {
        pasajero_id: 999,
        destino_latitud: 18.485,
        destino_longitud: -69.9295,
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createTrip(createTripDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if passenger is already in a trip', async () => {
      const createTripDto = {
        pasajero_id: 1,
        destino_latitud: 18.485,
        destino_longitud: -69.9295,
      };

      const pasajero = {
        id: 1,
        role: UserRole.PASSENGER,
        estado: EstadoViaje.OCUPADO,
      } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(pasajero);

      await expect(service.createTrip(createTripDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('completeTripAndGenerateInvoice', () => {
    it('should complete a trip and generate an invoice', async () => {
      const trip = {
        id: 1,
        estado: EstadoViaje.OCUPADO,
        pasajero: {
          id: 1,
          estado: EstadoViaje.OCUPADO,
          role: UserRole.PASSENGER,
        } as User,
        conductor: {
          id: 2,
          estado: EstadoViaje.OCUPADO,
          role: UserRole.DRIVER,
        } as User,
      } as Trip;

      const invoice = { id: 1 } as Invoice;
      const buffer = Buffer.from('invoice-pdf');

      jest.spyOn(tripsRepository, 'findOne').mockResolvedValue(trip);
      jest.spyOn(tripsRepository, 'save').mockResolvedValue(trip);
      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce(trip.pasajero);
      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce(trip.conductor);
      jest
        .spyOn(mockInvoicesService, 'createInvoice')
        .mockResolvedValue(invoice);
      jest
        .spyOn(mockInvoicesService, 'generateInvoicePdf')
        .mockResolvedValue(buffer);

      const result = await service.completeTripAndGenerateInvoice(1);
      expect(result).toEqual(buffer);
      expect(tripsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, estado: EstadoViaje.OCUPADO },
        relations: ['pasajero', 'conductor'],
      });
      expect(tripsRepository.save).toHaveBeenCalledWith(trip);
      expect(mockInvoicesService.createInvoice).toHaveBeenCalledWith(trip);
      expect(mockInvoicesService.generateInvoicePdf).toHaveBeenCalledWith(
        invoice.id,
      );
    });

    it('should throw NotFoundException if trip is not found or already completed', async () => {
      jest.spyOn(tripsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.completeTripAndGenerateInvoice(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
