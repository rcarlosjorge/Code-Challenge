import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { User } from 'src/db/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [DriversService],
  controllers: [DriversController],
})
export class DriversModule {}
