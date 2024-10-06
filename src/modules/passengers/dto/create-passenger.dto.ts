import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { EstadoViaje } from '../../../database/entities/user.entity';

export class CreatePassengerDto {
  @ApiProperty({
    description: 'Nombre del pasajero',
    example: 'Carlos',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Latitud geográfica del pasajero',
    example: 18.4845,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitud geográfica del pasajero',
    example: -69.9295,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Rol del usuario (passenger)',
    example: 'passenger',
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'Estado de actividad del pasajero',
    example: 'disponible',
  })
  @IsString()
  estado: EstadoViaje;
}
