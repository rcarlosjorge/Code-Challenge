import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { DriversModule } from './drivers/drivers.module';
import { PassengersModule } from './passengers/passengers.module';
import { TripsModule } from './trips/trips.module';
import { InvoicesModule } from './invoices/invoices.module';

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
