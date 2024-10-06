import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsModule } from './modules/trips/trips.module';
import { DbModule } from './database/db.module';
import { PassengersModule } from './modules/passengers/passengers.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [
    DbModule,
    PassengersModule,
    DriversModule,
    TripsModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
