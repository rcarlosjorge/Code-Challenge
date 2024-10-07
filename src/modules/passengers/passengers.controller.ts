import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PassengersService } from './passengers.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../database/entities/user.entity';

@ApiTags('Passengers')
@Controller('passengers')
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get('nearest-drivers')
  async findNearestDrivers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<User[]> {
    return this.passengersService.findNearestDrivers(latitude, longitude);
  }

  @Get()
  findAll() {
    return this.passengersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.passengersService.findOne(id);
  }

  @Post()
  create(@Body() createPassengerDto: CreatePassengerDto) {
    return this.passengersService.create(createPassengerDto);
  }
}
