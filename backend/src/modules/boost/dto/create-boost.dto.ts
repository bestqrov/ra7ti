import { ApiProperty } from '@nestjs/swagger';
import { BoostPackage } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class CreateBoostDto {
  @ApiProperty({ example: 'uuid-of-trip' })
  @IsUUID()
  tripId: string;

  @ApiProperty({
    enum: BoostPackage,
    description: 'BASIC = 24h, STANDARD = 72h, PREMIUM = 7 days',
  })
  @IsEnum(BoostPackage)
  package: BoostPackage;
}
