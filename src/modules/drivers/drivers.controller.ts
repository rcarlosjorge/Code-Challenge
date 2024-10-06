import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { User } from '../../database/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Driver')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('nearest-drivers')
  async findAvailableDrivers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<User[]> {
    return this.driversService.findAvailableDriversInRadius(
      latitude,
      longitude,
    );
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.driversService.findAll();
  }

  @Get('available')
  async findAvailableDriversStatus(): Promise<User[]> {
    return this.driversService.findAvailableDrivers();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.driversService.findOne(id);
  }

  @Post()
  create(@Body() createDriverDto: CreateDriverDto): Promise<User> {
    return this.driversService.create(createDriverDto);
  }
}
