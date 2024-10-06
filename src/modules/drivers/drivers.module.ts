import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { User } from '../../database/entities/user.entity';
import { Config } from '../../database/entities/config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Config])],
  providers: [DriversService],
  controllers: [DriversController],
})
export class DriversModule {}
