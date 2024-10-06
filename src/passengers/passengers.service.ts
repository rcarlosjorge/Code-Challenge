import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoViaje, User, UserRole } from '../db/entities/user.entity';

@Injectable()
export class PassengersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    return this.usersRepository.save(passenger);
}


  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.PASSENGER },
    });
  }

  async findOne(id: number): Promise<User> {
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
    const drivers = await this.usersRepository.find({
      where: { role: UserRole.DRIVER },
    });

    const driversWithDistance = drivers.map((driver) => ({
      driver,
      distance: this.calculateDistance(
        latitude,
        longitude,
        driver.latitude,
        driver.longitude,
      ),
    }));

    return driversWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map((item) => item.driver);
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
