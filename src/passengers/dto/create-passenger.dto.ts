import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { EstadoViaje } from '../../db/entities/user.entity';

export class CreatePassengerDto {
  @ApiProperty({
    description: 'Nombre del pasajero',
    example: 'Carlos',
  })
  @IsString()
  name: string; // Campo para el nombre del pasajero.

  @ApiProperty({
    description: 'Latitud geográfica del pasajero',
    example: 18.4845,
  })
  @IsNumber()
  latitude: number; // Campo para la latitud.

  @ApiProperty({
    description: 'Longitud geográfica del pasajero',
    example: -69.9295,
  })
  @IsNumber()
  longitude: number; // Campo para la longitud.

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
