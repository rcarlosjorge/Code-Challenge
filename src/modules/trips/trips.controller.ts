import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  StreamableFile,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';
import { ApiTags } from '@nestjs/swagger';
import { Readable } from 'stream';

@ApiTags('Rides')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('active')
  getActiveTrips(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<Trip[]> {
    return this.tripsService.getActiveTrips(page, limit);
  }

  @Post()
  createTrip(@Body() createTripDto: CreateTripDto): Promise<Trip> {
    return this.tripsService.createTrip(createTripDto);
  }

  @Patch(':id/complete')
  async completeTrip(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const pdfBuffer =
      await this.tripsService.completeTripAndGenerateInvoice(id);

    const readable = new Readable();
    readable.push(pdfBuffer);
    readable.push(null);

    return new StreamableFile(readable, {
      disposition: `attachment; filename=factura_${id}.pdf`,
      type: 'application/pdf',
    });
  }
}
