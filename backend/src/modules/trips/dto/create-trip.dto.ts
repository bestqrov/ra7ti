import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'uuid-of-bus' })
  @IsUUID()
  busId: string;

  @ApiProperty({ example: 'Algiers' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'Oran' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2025-06-01T08:00:00.000Z' })
  @IsDateString()
  departureAt: string;

  @ApiProperty({ example: '2025-06-01T12:00:00.000Z' })
  @IsDateString()
  arrivalAt: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 44 })
  @IsNumber()
  @Min(1)
  availableSeats: number;
}
