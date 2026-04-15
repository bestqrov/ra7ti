import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-trip' })
  @IsUUID()
  tripId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  seatsCount: number;

  @ApiPropertyOptional({ example: ['A1', 'A2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  seatNumbers?: string[];
}
