import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'uuid-of-booking' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 'card', enum: ['card', 'cash', 'wallet'] })
  @IsString()
  @IsIn(['card', 'cash', 'wallet'])
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'TXN_123456789' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
