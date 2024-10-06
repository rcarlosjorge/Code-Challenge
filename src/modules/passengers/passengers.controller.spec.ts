import { Test, TestingModule } from '@nestjs/testing';
import { PassengersController } from './passengers.controller';
import { PassengersService } from './passengers.service';
import { User, UserRole, EstadoViaje } from '../../database/entities/user.entity';
import { CreatePassengerDto } from './dto/create-passenger.dto';

describe('PassengersController', () => {
  let controller: PassengersController;
  let service: PassengersService;

  // Mock del servicio
  const mockPassengersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findNearestDrivers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengersController],
      providers: [
        {
          provide: PassengersService,
          useValue: mockPassengersService,
        },
      ],
    }).compile();

    controller = module.get<PassengersController>(PassengersController);
    service = module.get<PassengersService>(PassengersService);
  });

  // Verifica que el controlador esté definido
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Prueba para el método findAll
  it('should call findAll and return a list of passengers', async () => {
    const passengers: User[] = [
      { id: 1, role: UserRole.PASSENGER, estado: EstadoViaje.ACTIVO } as User,
    ];
    jest.spyOn(service, 'findAll').mockResolvedValue(passengers);

    expect(await controller.findAll()).toBe(passengers);
    expect(service.findAll).toHaveBeenCalled();
  });

  // Prueba para el método findOne
  it('should return a single passenger', async () => {
    const passenger = { id: 1, role: UserRole.PASSENGER } as User;
    jest.spyOn(service, 'findOne').mockResolvedValue(passenger);

    expect(await controller.findOne(1)).toBe(passenger);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  // Prueba para el método create
  it('should create a new passenger', async () => {
    const createPassengerDto: CreatePassengerDto = {
        name: 'Test Passenger',
        latitude: 0,
        longitude: 0,
        role: '',
        estado: EstadoViaje.ACTIVO
    };
    const passenger = { id: 1, ...createPassengerDto, role: UserRole.PASSENGER } as User;

    jest.spyOn(service, 'create').mockResolvedValue(passenger);

    expect(await controller.create(createPassengerDto)).toBe(passenger);
    expect(service.create).toHaveBeenCalledWith(createPassengerDto);
  });

  // Prueba para el método findNearestDrivers
  it('should return a list of nearest drivers', async () => {
    const drivers: User[] = [
      { id: 1, role: UserRole.DRIVER, latitude: 10, longitude: 20 } as User,
    ];
    jest.spyOn(service, 'findNearestDrivers').mockResolvedValue(drivers);

    expect(await controller.findNearestDrivers(10, 20)).toBe(drivers);
    expect(service.findNearestDrivers).toHaveBeenCalledWith(10, 20);
  });
});
