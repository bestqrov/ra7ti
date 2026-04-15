import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.PASSENGER)
  @ApiOperation({ summary: '[Passenger] Pay for a booking' })
  processPayment(@CurrentUser() user: any, @Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(user.id, dto);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Company/Admin] List payments' })
  findAll(@CurrentUser() user: any) {
    const companyId = user.role === 'COMPANY_ADMIN' ? user.companyId : undefined;
    return this.paymentsService.findAll(companyId);
  }

  @Get('commission-report')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Commission report (admin = all; company = own)' })
  commissionReport(@CurrentUser() user: any) {
    const companyId = user.role === 'COMPANY_ADMIN' ? user.companyId : undefined;
    return this.paymentsService.commissionReport(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/refund')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Refund a payment' })
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }
}
