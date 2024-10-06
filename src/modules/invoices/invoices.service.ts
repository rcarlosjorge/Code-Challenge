import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Config } from '../../database/entities/config.entity';
import { InvoiceTemplate } from '../../templates/invoiceTemplate';
import { getConfig } from '../../utils/config.util';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async createInvoice(trip: Trip): Promise<Invoice> {
    const config = await getConfig(this.configRepository);

    const trip_total = this.calculateTotal(trip, config.price_per_km);
    const service_fee = this.calculateServiceFee(
      trip_total,
      config.service_fee_percentage,
    );
    const tax = trip_total * config.tax_percentage;
    const total = trip_total + service_fee + tax;

    const invoice = this.invoicesRepository.create({
      trip,
      trip_total,
      service_fee,
      tax,
      total,
    });

    return this.invoicesRepository.save(invoice);
  }

  async generateInvoicePdf(invoiceId: number): Promise<Buffer> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
      relations: ['trip', 'trip.pasajero'],
    });

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada.`);
    }
    const config = await getConfig(this.configRepository);
    const template = Handlebars.compile(InvoiceTemplate);

    const invoiceData = {
      company_logo:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBSMUew9zTdrrrYo7sufVRispLXWdw7JvK0A&s',
      company_name: 'Taxi24',
      company_address: 'Avenida John F. Kennedy, Santo Domingo 10203',
      company_phone: '(809) 544-8905',
      invoice_number: invoice.id,
      created_date: invoice.created_at.toDateString(),
      customer_name: invoice.trip.pasajero.name,
      trip_origin: `${invoice.trip.origen_latitud}, ${invoice.trip.origen_longitud}`,
      trip_destination: `${invoice.trip.destino_latitud}, ${invoice.trip.destino_longitud}`,
      trip_distance: this.calculateDistance(
        invoice.trip.origen_latitud,
        invoice.trip.origen_longitud,
        invoice.trip.destino_latitud,
        invoice.trip.destino_longitud,
      ).toFixed(2),
      price_per_km: config.price_per_km,
      trip_total: invoice.trip_total,
      service_fee: invoice.service_fee,
      tax: invoice.tax,
      total: invoice.total,
    };

    const htmlToRender = template(invoiceData);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlToRender);

    const pdfBuffer = Buffer.from(await page.pdf({ format: 'A4' }));

    await browser.close();
    return pdfBuffer;
  }

  private calculateTotal(trip: Trip, pricePerKm: number): number {
    const distanceKm = this.calculateDistance(
      trip.origen_latitud,
      trip.origen_longitud,
      trip.destino_latitud,
      trip.destino_longitud,
    );
    return pricePerKm * distanceKm;
  }

  private calculateServiceFee(
    tripTotal: number,
    serviceFeePercentage: number,
  ): number {
    return tripTotal * serviceFeePercentage;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
