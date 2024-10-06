import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { Trip } from './entities/trip.entity';
import { PassengersModule } from '../passengers/passengers.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { User } from '../../database/entities/user.entity';
import { TripsController } from './trips.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, User]),
    PassengersModule,
    InvoicesModule,
  ],
  providers: [TripsService],
  controllers: [TripsController],
})
export class TripsModule {}
