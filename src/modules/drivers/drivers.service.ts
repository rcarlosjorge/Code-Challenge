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
import { getConfig } from '../../utils/config/config.util';
import { calculateDistance } from '../../utils/distance/distance.util';
import { validateId } from '../../utils/validation/id-validation.util';
import { getPaginationOptions } from '../../utils/pagination/pagination.util';
import { validateCoordinates } from '../../utils/validation/coordinate-validation.util';

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

  async findAll(page: number, limit: number): Promise<User[]> {
    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const { page: currentPage, limit: currentLimit } = getPaginationOptions(
      page,
      limit,
    );

    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    });

    if (!drivers.length) {
      throw new NotFoundException('No drivers found');
    }

    return drivers;
  }

  async findOne(id: number): Promise<User> {
    validateId(id);

    const driver = await this.usersRepository.findOne({
      where: { id, role: UserRole.DRIVER },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async findAvailableDrivers(
    page: number = 1,
    limit: number = 10,
  ): Promise<User[]> {
    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const { page: currentPage, limit: currentLimit } = getPaginationOptions(
      page,
      limit,
    );

    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER, estado: EstadoViaje.ACTIVO },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    });

    if (!drivers.length) {
      throw new NotFoundException('No available drivers found');
    }

    return drivers;
  }

  async findAvailableDriversInRadius(
    latitude: number,
    longitude: number,
  ): Promise<User[]> {
    validateCoordinates(latitude, longitude);

    const config = await getConfig(this.configRepository);

    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER, estado: EstadoViaje.ACTIVO },
    });

    if (!drivers.length) {
      throw new NotFoundException('No available drivers found');
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
