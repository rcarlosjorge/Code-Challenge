import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import {
  User,
  UserRole,
  EstadoViaje,
} from '../../database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.DRIVER },
    });
  }

  async findOne(id: number): Promise<User> {
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
    radius: number = 3,
  ): Promise<User[]> {
    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER },
    });

    const driversWithinRadius = drivers.filter((driver) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        driver.latitude,
        driver.longitude,
      );
      return distance <= radius;
    });

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