import { Test, TestingModule } from '@nestjs/testing';
import { PassengersService } from './passengers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  User,
  UserRole,
  EstadoViaje,
} from '../../database/entities/user.entity';
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

  describe('findAll', () => {
    it('debería retornar todos los pasajeros', async () => {
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

      jest.spyOn(usersRepository, 'find').mockResolvedValue(pasajeros);

      const resultado = await service.findAll();
      expect(resultado).toEqual(pasajeros);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.PASSENGER },
      });
    });
  });
});
