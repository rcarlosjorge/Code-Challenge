import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from './drivers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoViaje, User, UserRole } from '../db/entities/user.entity';
import { Repository } from 'typeorm';

describe('DriversService', () => {
  let service: DriversService;
  let usersRepository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all drivers', async () => {
    const drivers: User[] = [
      {
        id: 1,
        name: 'Juan',
        latitude: 18.4861,
        longitude: -69.9312,
        role: UserRole.DRIVER,
        estado: EstadoViaje.ACTIVO,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'María',
        latitude: 18.485,
        longitude: -69.93,
        role: UserRole.DRIVER,
        estado: EstadoViaje.ACTIVO,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    jest.spyOn(usersRepository, 'find').mockResolvedValue(drivers);

    const result = await service.findAll();
    expect(result).toEqual(drivers);
    expect(usersRepository.find).toHaveBeenCalled();
  });
});
