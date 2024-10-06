import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Repository } from 'typeorm';
import { EstadoViaje, User } from '../db/entities/user.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

describe('TripsService', () => {
  let service: TripsService;
  let tripsRepository: Repository<Trip>;

  const mockTripsRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: getRepositoryToken(Trip), useValue: mockTripsRepository },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    tripsRepository = module.get<Repository<Trip>>(getRepositoryToken(Trip));
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
        estado: 'ocupado',
      },
    });
  });
});
