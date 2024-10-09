import { BadRequestException } from '@nestjs/common';

export function validateId(id: number): void {
  if (isNaN(id) || id <= 0) {
    throw new BadRequestException('Invalid ID provided');
  }
}
