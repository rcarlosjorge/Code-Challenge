import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './entities/trip.entity';
import { User } from '../db/entities/user.entity';
import { PassengersModule } from '../passengers/passengers.module';
import { InvoicesModule } from '../invoices/invoices.module';

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
