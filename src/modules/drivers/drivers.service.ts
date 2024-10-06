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
import { getConfig } from 'src/utils/config.util';

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
      where: { role: UserRole.DRIVER },
    });

    if (!drivers.length) {
      throw new NotFoundException('No drivers found');
    }

    const driversWithinRadius = drivers.filter((driver) => {
      const distance = this.calculateDistance(
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

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
