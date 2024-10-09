import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { EstadoViaje } from '../../../database/entities/user.entity';

export class CreatePassengerDto {
  @ApiProperty({
    description: 'Nombre del pasajero',
    example: 'Carlos',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @ApiProperty({
    description: 'Latitud geográfica del pasajero',
    example: 18.4845,
  })
  @IsNumber()
  @Min(18.2, { message: 'La latitud debe ser mayor o igual a 18.2' })
  @Max(18.6, { message: 'La latitud debe ser menor o igual a 18.6' })
  latitude: number;

  @ApiProperty({
    description: 'Longitud geográfica del pasajero',
    example: -69.9295,
  })
  @IsNumber()
  @Min(-70.1, { message: 'La longitud debe ser mayor o igual a -70.1' })
  @Max(-69.7, { message: 'La longitud debe ser menor o igual a -69.7' })
  longitude: number;

  @ApiProperty({
    description: 'Rol del usuario (passenger)',
    example: 'passenger',
  })
  @IsString()
  @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  role: string;

  @ApiProperty({
    description: 'Estado de actividad del pasajero',
    example: 'disponible',
  })
  @IsString()
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  estado: EstadoViaje;
}
