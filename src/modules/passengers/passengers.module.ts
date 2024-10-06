import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassengersService } from './passengers.service';
import { User } from '../../database/entities/user.entity';
import { PassengersController } from './passengers.controller';
import { Config } from '../../database/entities/config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Config])],
  providers: [PassengersService],
  controllers: [PassengersController],
  exports: [PassengersService],
})
export class PassengersModule {}
