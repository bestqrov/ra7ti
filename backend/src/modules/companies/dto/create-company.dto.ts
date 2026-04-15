import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Atlas Transport' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contact@atlas-transport.dz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+213551234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ minimum: 5, maximum: 7, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(7)
  commissionRate?: number;
}
