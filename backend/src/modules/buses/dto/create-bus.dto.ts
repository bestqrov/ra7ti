import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBusDto {
  @ApiProperty({ example: '123 DZA 16' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ enum: BusType, default: BusType.STANDARD })
  @IsEnum(BusType)
  type: BusType;

  @ApiProperty({ example: 44 })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    example: { wifi: true, ac: true, usb: true, toilet: false },
  })
  @IsOptional()
  @IsObject()
  amenities?: Record<string, boolean>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
