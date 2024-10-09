import { Repository } from 'typeorm';
import { Config } from '../../database/entities/config.entity';
import { NotFoundException } from '@nestjs/common';

export async function getConfig(
  configRepository: Repository<Config>,
): Promise<Config> {
  const config = await configRepository.findOneBy({});

  if (!config) {
    throw new NotFoundException('No se encontraron valores de configuración.');
  }

  return config;
}
