import { Test, TestingModule } from '@nestjs/testing';
import { PassengersService } from './passengers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  User,
  UserRole,
  EstadoViaje,
} from '../../database/entities/user.entity';
import { Repository } from 'typeorm';
import { Config } from '../../database/entities/config.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as distanceUtil from '../../utils/distance/distance.util';

describe('PassengersService', () => {
  let service: PassengersService;
  let usersRepository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockConfigRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassengersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Config), useValue: mockConfigRepository },
      ],
    }).compile();

    service = module.get<PassengersService>(PassengersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería retornar todos los pasajeros con paginación', async () => {
      const pasajeros: User[] = [
        {
          id: 3,
          name: 'Carlos López',
          latitude: 18.4862,
          longitude: -69.9313,
          role: UserRole.PASSENGER,
          estado: EstadoViaje.ACTIVO,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: 'Ana Martínez',
          latitude: 18.4851,
          longitude: -69.9301,
          role: UserRole.PASSENGER,
          estado: EstadoViaje.ACTIVO,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const take = limit;

      jest.spyOn(usersRepository, 'find').mockResolvedValue(pasajeros);

      const resultado = await service.findAll(page, limit);
      expect(resultado).toEqual(pasajeros);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.PASSENGER },
        skip,
        take,
      });
    });

    it('debería lanzar NotFoundException si no se encuentran pasajeros', async () => {
      const page = 1;
      const limit = 10;
  
      jest.spyOn(usersRepository, 'find').mockResolvedValue([]); 
  
      await expect(service.findAll(page, limit)).rejects.toThrow(NotFoundException); 
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.PASSENGER },
        skip: 0,
        take: limit,
      });
    });
  });

  describe('create', () => {
    it('should create and save a passenger', async () => {
      const createPassengerDto = {
        name: 'Passenger Test',
        latitude: 18.5,
        longitude: -69.9,
        role: 'passenger',
        estado: EstadoViaje.ACTIVO,
        active: true,
      };

      const savedPassenger = {
        ...createPassengerDto,
        id: 1,
        role: UserRole.PASSENGER,
        estado: EstadoViaje.ACTIVO,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersRepository, 'create').mockReturnValue(savedPassenger);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(savedPassenger);

      const result = await service.create(createPassengerDto);
      expect(result).toEqual(savedPassenger);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createPassengerDto,
        role: UserRole.PASSENGER,
        estado: EstadoViaje.ACTIVO,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(usersRepository.save).toHaveBeenCalledWith(savedPassenger);
    });
  });

  describe('findOne', () => {
    it('should return a passenger by ID', async () => {
      const passenger = {
        id: 1,
        name: 'Passenger Test',
        latitude: 18.5,
        longitude: -69.9,
        role: UserRole.PASSENGER,
        estado: EstadoViaje.ACTIVO,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(passenger);

      const result = await service.findOne(1);
      expect(result).toEqual(passenger);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, role: UserRole.PASSENGER },
      });
    });

    it('should throw an error if passenger not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if invalid ID is provided', async () => {
      await expect(service.findOne(-1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findNearestDrivers', () => {
    it('should return nearest drivers within radius', async () => {
      const drivers = [
        {
          id: 1,
          name: 'Driver 1',
          latitude: 18.5,
          longitude: -69.9,
          role: UserRole.DRIVER,
        } as User,
        {
          id: 2,
          name: 'Driver 2',
          latitude: 18.5,
          longitude: -69.95,
          role: UserRole.DRIVER,
        } as User,
      ];

      const config = { number_of_drivers_to_return: 2 };
      jest.spyOn(distanceUtil, 'calculateDistance').mockReturnValue(1);
      mockConfigRepository.findOneBy.mockResolvedValue(config);
      jest.spyOn(usersRepository, 'find').mockResolvedValue(drivers);

      const result = await service.findNearestDrivers(18.5, -69.9);
      expect(result).toHaveLength(2);
      expect(result).toEqual(drivers);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.DRIVER },
      });
    });

    it('should throw an error if no drivers found near the location', async () => {
      const drivers = [];
      const config = { number_of_drivers_to_return: 2 };
      mockConfigRepository.findOneBy.mockResolvedValue(config);
      jest.spyOn(usersRepository, 'find').mockResolvedValue(drivers);

      await expect(service.findNearestDrivers(18.5, -69.9)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
