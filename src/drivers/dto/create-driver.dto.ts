import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({
    description: 'Nombre del conductor',
    example: 'Juan',
  })
  @IsString()
  name: string; // Cambiado a name para que coincida con la estructura unificada.

  @ApiProperty({
    description: 'Latitud geográfica del conductor',
    example: 18.464601,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitud geográfica del conductor',
    example: -69.932553,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Rol del usuario (driver)',
    example: 'driver',
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'Estado de actividad del conductor',
    example: 'disponible',
  })
  @IsString()
  estado: string;

  @ApiProperty({
    description: 'Estado de actividad del conductor',
    example: true,
  })
  @IsBoolean()
  active: boolean;
}
