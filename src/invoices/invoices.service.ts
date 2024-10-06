import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Trip } from '../trips/entities/trip.entity';
import { InvoiceTemplate } from '../templates/invoiceTemplate';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  async createInvoice(trip: Trip): Promise<Invoice> {
    const total = this.calculateTotal(trip);
    const invoice = this.invoicesRepository.create({ trip, total });
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

    const template = Handlebars.compile(InvoiceTemplate);

    const invoiceData = {
      company_logo: 'https://example.com/logo.png',
      company_name: 'Taxi24',
      company_address: 'Calle Falsa 123, Santo Domingo',
      company_phone: '809-123-4567',
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
      ),
      price_per_km: 25,
      trip_total: invoice.total,
      tax: (invoice.total * 0.18).toFixed(2),
      total: (invoice.total * 1.18).toFixed(2),
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

  calculateTotal(trip: Trip): number {
    const pricePerKm = 25;
    const distanceKm = this.calculateDistance(
      trip.origen_latitud,
      trip.origen_longitud,
      trip.destino_latitud,
      trip.destino_longitud,
    );
    return pricePerKm * distanceKm;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
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
