import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({
    description: 'Nombre del conductor',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @ApiProperty({
    description: 'Latitud geográfica del conductor',
    example: 18.464601,
  })
  @IsNumber()
  @Min(18.2, { message: 'La latitud debe ser mayor o igual a 18.2' })
  @Max(18.6, { message: 'La latitud debe ser menor o igual a 18.6' })
  latitude: number;

  @ApiProperty({
    description: 'Longitud geográfica del conductor',
    example: -69.932553,
  })
  @IsNumber()
  @Min(-70.1, { message: 'La longitud debe ser mayor o igual a -70.1' })
  @Max(-69.7, { message: 'La longitud debe ser menor o igual a -69.7' })
  longitude: number;

  @ApiProperty({
    description: 'Rol del usuario (driver)',
    example: 'driver',
  })
  @IsString()
  @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  role: string;

  @ApiProperty({
    description: 'Estado de actividad del conductor',
    example: 'disponible',
  })
  @IsString()
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  estado: string;

  @ApiProperty({
    description: 'Indica si el conductor está activo',
    example: true,
  })
  @IsBoolean()
  active: boolean;
}
