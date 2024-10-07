import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from './drivers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EstadoViaje,
  User,
  UserRole,
} from '../../database/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Config } from '../../database/entities/config.entity';
import * as distanceUtil from '../../utils/distance.util';

describe('DriversService', () => {
  let service: DriversService;
  let usersRepository: Repository<User>;
  let configRepository: Repository<Config>;

  const mockUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: getRepositoryToken(Config), useValue: mockConfigRepository },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configRepository = module.get<Repository<Config>>(
      getRepositoryToken(Config),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all drivers', async () => {
      const drivers: User[] = [
        {
          id: 1,
          name: 'Juan Pérez',
          latitude: 18.4861,
          longitude: -69.9312,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'María García',
          latitude: 18.485,
          longitude: -69.93,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockUsersRepository.find.mockResolvedValue(drivers);

      const result = await service.findAll();
      expect(result).toEqual(drivers);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.DRIVER },
      });
    });
  });

  describe('create', () => {
    it('should create and save a driver', async () => {
      const createDriverDto = {
        name: 'Pedro',
        latitude: 18.5,
        longitude: -69.9,
        role: 'driver',
        estado: 'disponible',
        active: true,
      };
      const savedDriver = {
        ...createDriverDto,
        id: 1,
        role: UserRole.DRIVER,
        estado: EstadoViaje.ACTIVO,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUsersRepository.create.mockReturnValue(savedDriver);
      mockUsersRepository.save.mockResolvedValue(savedDriver);

      const result = await service.create(createDriverDto);
      expect(result).toEqual(savedDriver);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createDriverDto,
        role: UserRole.DRIVER,
        estado: EstadoViaje.ACTIVO,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(usersRepository.save).toHaveBeenCalledWith(savedDriver);
    });
  });

  describe('findOne', () => {
    it('should return a driver by ID', async () => {
      const driver = {
        id: 1,
        name: 'Pedro',
        role: UserRole.DRIVER,
        estado: EstadoViaje.ACTIVO,
      };

      mockUsersRepository.findOne.mockResolvedValue(driver);

      const result = await service.findOne(1);
      expect(result).toEqual(driver);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, role: UserRole.DRIVER },
      });
    });

    it('should throw an error if driver not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailableDrivers', () => {
    it('should return active drivers', async () => {
      const drivers = [
        {
          id: 1,
          name: 'Pedro',
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
        },
      ];

      mockUsersRepository.find.mockResolvedValue(drivers);

      const result = await service.findAvailableDrivers();
      expect(result).toEqual(drivers);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.DRIVER, estado: EstadoViaje.ACTIVO },
      });
    });
  });

  describe('findAvailableDriversInRadius', () => {
    it('should return drivers within radius', async () => {
      const drivers = [
        {
          id: 1,
          name: 'Pedro',
          latitude: 18.5,
          longitude: -69.9,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
        },
      ];

      const config = { distance_km: 10 };
      jest.spyOn(distanceUtil, 'calculateDistance').mockReturnValue(5);
      mockUsersRepository.find.mockResolvedValue(drivers);
      mockConfigRepository.findOneBy.mockResolvedValue(config);

      const result = await service.findAvailableDriversInRadius(18.5, -69.9);
      expect(result).toEqual(drivers);
      expect(distanceUtil.calculateDistance).toHaveBeenCalledWith(
        18.5,
        -69.9,
        18.5,
        -69.9,
      );
    });

    it('should throw an error if no drivers within radius', async () => {
      const drivers = [
        {
          id: 1,
          name: 'Pedro',
          latitude: 18.5,
          longitude: -69.9,
          role: UserRole.DRIVER,
          estado: EstadoViaje.ACTIVO,
        },
      ];

      const config = { distance_km: 3 };
      jest.spyOn(distanceUtil, 'calculateDistance').mockReturnValue(5);
      mockUsersRepository.find.mockResolvedValue(drivers);
      mockConfigRepository.findOneBy.mockResolvedValue(config);

      await expect(
        service.findAvailableDriversInRadius(18.5, -69.9),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
