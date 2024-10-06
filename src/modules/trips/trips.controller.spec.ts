import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { Trip } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';

describe('TripsController', () => {
  let controller: TripsController;
  let service: TripsService;

  // Mock del servicio
  const mockTripsService = {
    getActiveTrips: jest.fn(),
    createTrip: jest.fn(),
    completeTripAndGenerateInvoice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
    service = module.get<TripsService>(TripsService);
  });

  // Verifica que el controlador esté definido
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Prueba para el método getActiveTrips
  it('should call getActiveTrips and return a list of active trips', async () => {
    const trips: Trip[] = [{ id: 1, estado: 'OCUPADO' } as unknown as Trip];
    jest.spyOn(service, 'getActiveTrips').mockResolvedValue(trips);

    expect(await controller.getActiveTrips()).toBe(trips);
    expect(service.getActiveTrips).toHaveBeenCalled();
  });

  // Prueba para el método createTrip
  it('should create a new trip', async () => {
    const createTripDto: CreateTripDto = {
      pasajero_id: 1,
      origen_latitud: 10,
      origen_longitud: 20,
      destino_latitud: 30,
      destino_longitud: 40,
    };
    const trip = {
      id: 1,
      ...createTripDto,
      estado: 'OCUPADO',
    } as unknown as Trip;

    jest.spyOn(service, 'createTrip').mockResolvedValue(trip);

    expect(await controller.createTrip(createTripDto)).toBe(trip);
    expect(service.createTrip).toHaveBeenCalledWith(createTripDto);
  });

  // Prueba para el método completeTrip
  it('should complete a trip and return a PDF', async () => {
    const pdfBuffer = Buffer.from('PDF content');
    jest
      .spyOn(service, 'completeTripAndGenerateInvoice')
      .mockResolvedValue(pdfBuffer);

    const result = await controller.completeTrip(1);
    expect(service.completeTripAndGenerateInvoice).toHaveBeenCalledWith(1);

    // Verificamos que el contenido retornado sea un StreamableFile con el buffer
    expect(result).toBeInstanceOf(StreamableFile);
    const readable = (result as StreamableFile).getStream() as Readable;
    const data = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      readable.on('data', (chunk) => chunks.push(chunk));
      readable.on('end', () => resolve(Buffer.concat(chunks)));
    });

    expect(data.toString()).toBe('PDF content');
  });
});
