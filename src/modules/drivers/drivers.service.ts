import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import {
  User,
  UserRole,
  EstadoViaje,
} from '../../database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../../database/entities/config.entity';
import { getConfig } from '../../utils/config.util';
import { calculateDistance } from '../../utils/distance.util';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<User> {
    const currentDate = new Date();

    const driver = this.usersRepository.create({
      ...createDriverDto,
      role: UserRole.DRIVER,
      estado: EstadoViaje.ACTIVO,
      created_at: currentDate,
      updated_at: currentDate,
    });
    return await this.usersRepository.save(driver);
  }

  async findAll(): Promise<User[]> {
    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER },
    });

    if (!drivers.length) {
      throw new NotFoundException('No drivers found');
    }

    return drivers;
  }

  async findOne(id: number): Promise<User> {
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('Invalid ID provided');
    }

    const driver = await this.usersRepository.findOne({
      where: { id, role: UserRole.DRIVER },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async findAvailableDrivers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.DRIVER, estado: EstadoViaje.ACTIVO },
    });
  }

  async findAvailableDriversInRadius(
    latitude: number,
    longitude: number,
  ): Promise<User[]> {
    const config = await getConfig(this.configRepository);

    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER, estado: EstadoViaje.ACTIVO },
    });

    if (!drivers.length) {
      throw new NotFoundException('No drivers found');
    }

    const driversWithinRadius = drivers.filter((driver) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        driver.latitude,
        driver.longitude,
      );
      return distance <= config.distance_km;
    });

    if (!driversWithinRadius.length) {
      throw new NotFoundException(
        'No drivers found within the specified radius',
      );
    }

    return driversWithinRadius;
  }
}
