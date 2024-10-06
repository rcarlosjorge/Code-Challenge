import { Controller } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Invoice')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}
}
