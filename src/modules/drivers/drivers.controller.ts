import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseFloatPipe,
  ParseIntPipe,
} from '@nestjs/common';
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
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ): Promise<User[]> {
    return this.driversService.findAvailableDriversInRadius(
      latitude,
      longitude,
    );
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<User[]> {
    return this.driversService.findAll(page, limit);
  }

  @Get('available')
  async findAvailableDriversStatus(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<User[]> {
    return this.driversService.findAvailableDrivers(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.driversService.findOne(id);
  }

  @Post()
  create(@Body() createDriverDto: CreateDriverDto): Promise<User> {
    return this.driversService.create(createDriverDto);
  }
}
