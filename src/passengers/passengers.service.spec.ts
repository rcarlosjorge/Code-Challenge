import { Test, TestingModule } from '@nestjs/testing';
import { PassengersService } from './passengers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, EstadoViaje } from '../db/entities/user.entity';
import { Repository } from 'typeorm';

describe('PassengersService', () => {
  let service: PassengersService;
  let usersRepository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassengersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<PassengersService>(PassengersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all passengers', async () => {
    const passengers: User[] = [
      { id: 1, name: 'Carlos', latitude: 18.4845, longitude: -69.9295, role: UserRole.PASSENGER, estado: EstadoViaje.ACTIVO, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Ana', latitude: 18.4850, longitude: -69.9300, role: UserRole.PASSENGER, estado: EstadoViaje.ACTIVO, created_at: new Date(), updated_at: new Date() },
    ];

    jest.spyOn(usersRepository, 'find').mockResolvedValue(passengers);

    const result = await service.findAll();
    expect(result).toEqual(passengers);
    expect(usersRepository.find).toHaveBeenCalled();
  });
});
