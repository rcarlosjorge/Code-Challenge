import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengersService } from './passengers.service';
import { User } from '../db/entities/user.entity';
import { PassengersController } from './passengers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PassengersService],
  controllers: [PassengersController],
  exports: [PassengersService],
})
export class PassengersModule {}