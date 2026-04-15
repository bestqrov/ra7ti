import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Process a payment for a booking.
   * Commission is calculated from the company's configured rate (5–7 %).
   */
  async processPayment(userId: string, dto: ProcessPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: dto.bookingId },
        include: { company: true, payment: true },
      });

      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.userId !== userId) {
        throw new BadRequestException('This booking does not belong to you');
      }
      if (booking.status === 'CANCELLED') {
        throw new BadRequestException('Booking is cancelled');
      }
      if (booking.payment) {
        throw new ConflictException('Payment already processed for this booking');
      }

      const commissionRate = booking.company.commissionRate; // e.g. 5.0
      const amount = booking.totalPrice;
      const commissionAmount = parseFloat(
        ((amount * commissionRate) / 100).toFixed(2),
      );
      const netAmount = parseFloat((amount - commissionAmount).toFixed(2));

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          companyId: booking.companyId,
          amount,
          commissionRate,
          commissionAmount,
          netAmount,
          status: 'COMPLETED',
          paymentMethod: dto.paymentMethod,
          transactionId: dto.transactionId,
        },
      });

      // Confirm the booking on successful payment
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      });

      return payment;
    });
  }

  async refund(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === 'REFUNDED') {
      throw new BadRequestException('Payment already refunded');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      });

      return updated;
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.payment.findMany({
      where: companyId ? { companyId } : {},
      include: {
        booking: {
          select: { seatsCount: true, trip: { select: { origin: true, destination: true } } },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: { include: { trip: true } },
        user: { select: { name: true, email: true } },
        company: { select: { name: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async commissionReport(companyId?: string) {
    const where = companyId ? { companyId, status: 'COMPLETED' as any } : { status: 'COMPLETED' as any };

    const [aggregate, byCompany] = await Promise.all([
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true, commissionAmount: true, netAmount: true },
        _count: true,
      }),
      companyId
        ? null
        : this.prisma.payment.groupBy({
            by: ['companyId'],
            where: { status: 'COMPLETED' },
            _sum: { commissionAmount: true, netAmount: true, amount: true },
          }),
    ]);

    return {
      totalTransactions: aggregate._count,
      totalAmount: aggregate._sum.amount ?? 0,
      totalCommission: aggregate._sum.commissionAmount ?? 0,
      totalNetPaidToCompanies: aggregate._sum.netAmount ?? 0,
      byCompany: byCompany ?? [],
    };
  }
}
