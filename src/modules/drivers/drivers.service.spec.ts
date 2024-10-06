import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from './drivers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EstadoViaje,
  User,
  UserRole,
} from '../../database/entities/user.entity';
import { Repository } from 'typeorm';

describe('DriversService', () => {
  let service: DriversService;
  let usersRepository: Repository<User>;

  const mockUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
});
