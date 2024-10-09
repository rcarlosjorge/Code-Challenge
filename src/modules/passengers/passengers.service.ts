import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EstadoViaje,
  User,
  UserRole,
} from '../../database/entities/user.entity';
import { getConfig } from '../../utils/config/config.util';
import { Config } from '../../database/entities/config.entity';
import { calculateDistance } from '../../utils/distance/distance.util';
import { validateId } from '../../utils/validation/id-validation.util';
import { getPaginationOptions } from '../../utils/pagination/pagination.util';
import { validateCoordinates } from '../../utils/validation/coordinate-validation.util';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async create(createPassengerDto: CreatePassengerDto): Promise<User> {
    const currentDate = new Date();

    const passenger = this.usersRepository.create({
      ...createPassengerDto,
      role: UserRole.PASSENGER,
      estado: EstadoViaje.ACTIVO,
      created_at: currentDate,
      updated_at: currentDate,
    });

    return await this.usersRepository.save(passenger);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const { page: currentPage, limit: currentLimit } = getPaginationOptions(
      page,
      limit,
    );

    const passengers = await this.usersRepository.find({
      where: { role: UserRole.PASSENGER },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    });

    if (!passengers.length) {
      throw new NotFoundException('No passengers found');
    }

    return passengers;
  }

  async findOne(id: number): Promise<User> {
    validateId(id);

    const passenger = await this.usersRepository.findOne({
      where: { id, role: UserRole.PASSENGER },
    });

    if (!passenger) {
      throw new NotFoundException(`Passenger with ID ${id} not found`);
    }

    return passenger;
  }

  async findNearestDrivers(
    latitude: number,
    longitude: number,
  ): Promise<User[]> {
    validateCoordinates(latitude, longitude);

    const config = await getConfig(this.configRepository);
    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER },
    });

    if (!drivers.length) {
      throw new NotFoundException('No drivers found');
    }

    const driversWithDistance = drivers.map((driver) => ({
      driver,
      distance: calculateDistance(
        latitude,
        longitude,
        driver.latitude,
        driver.longitude,
      ),
    }));

    const nearestDrivers = driversWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, config.number_of_drivers_to_return)
      .map((item) => item.driver);

    if (!nearestDrivers.length) {
      throw new NotFoundException(
        'No drivers found near the provided location',
      );
    }

    return nearestDrivers;
  }
}
