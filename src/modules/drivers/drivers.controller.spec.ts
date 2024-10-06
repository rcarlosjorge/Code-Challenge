import { Test, TestingModule } from '@nestjs/testing';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { EstadoViaje, User, UserRole } from '../../database/entities/user.entity';
import { CreateDriverDto } from './dto/create-driver.dto';

const mockDriversService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAvailableDrivers: jest.fn(),
    findAvailableDriversInRadius: jest.fn(),
  };

  
  describe('DriversController', () => {
    let controller: DriversController;
    let service: DriversService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [DriversController],
        providers: [
          {
            provide: DriversService,
            useValue: mockDriversService,
          },
        ],
      }).compile();
  
      controller = module.get<DriversController>(DriversController);
      service = module.get<DriversService>(DriversService);
    });
  
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  
    it('should call findAll and return a list of drivers', async () => {
      const drivers: User[] = [
        { id: 1, role: UserRole.DRIVER, estado: EstadoViaje.ACTIVO } as User,
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(drivers);
  
      expect(await controller.findAll()).toBe(drivers);
      expect(service.findAll).toHaveBeenCalled();
    });
  
    it('should create a new driver', async () => {
      const createDriverDto: CreateDriverDto = {
          name: 'Test Driver',
          latitude: 0,
          longitude: 0,
          role: '',
          estado: '',
          active: false
      };
      const driver = { id: 1, ...createDriverDto, role: UserRole.DRIVER } as unknown as User;
  
      jest.spyOn(service, 'create').mockResolvedValue(driver);
  
      expect(await controller.create(createDriverDto)).toBe(driver);
      expect(service.create).toHaveBeenCalledWith(createDriverDto);
    });
  
    it('should return a single driver', async () => {
      const driver = { id: 1, role: UserRole.DRIVER } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(driver);
  
      expect(await controller.findOne(1)).toBe(driver);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
  