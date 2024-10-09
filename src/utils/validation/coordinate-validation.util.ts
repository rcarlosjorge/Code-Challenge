import { BadRequestException } from '@nestjs/common';

export function validateCoordinates(latitude: number, longitude: number) {
  const minLatitude = 18.2;
  const maxLatitude = 18.6;
  const minLongitude = -70.1;
  const maxLongitude = -69.7;

  if (
    latitude < minLatitude ||
    latitude > maxLatitude ||
    longitude < minLongitude ||
    longitude > maxLongitude
  ) {
    throw new BadRequestException(
      `Invalid latitude or longitude. Valid range: Latitude (${minLatitude} - ${maxLatitude}), Longitude (${minLongitude} - ${maxLongitude})`,
    );
  }
}
