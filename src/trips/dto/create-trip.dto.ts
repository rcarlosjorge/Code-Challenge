import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({
    description: 'ID del pasajero que solicita el viaje',
    example: 9,
  })
  @IsNumber()
  @IsPositive()
  pasajero_id: number;

  @ApiProperty({
    description: 'Latitud del punto de origen',
    example: 18.4845,
  })
  @IsNumber()
  origen_latitud: number;

  @ApiProperty({
    description: 'Longitud del punto de origen',
    example: -69.9295,
  })
  @IsNumber()
  origen_longitud: number;

  @ApiProperty({
    description: 'Latitud del punto de destino',
    example: 18.491,
  })
  @IsNumber()
  destino_latitud: number;

  @ApiProperty({
    description: 'Longitud del punto de destino',
    example: -69.936,
  })
  @IsNumber()
  destino_longitud: number;
}
