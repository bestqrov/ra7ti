import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    // Lock-free optimistic booking with transaction
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: dto.tripId } });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status !== 'SCHEDULED' && trip.status !== 'ACTIVE') {
        throw new BadRequestException('Trip is not available for booking');
      }
      if (trip.availableSeats < dto.seatsCount) {
        throw new BadRequestException(
          `Only ${trip.availableSeats} seat(s) available`,
        );
      }

      const totalPrice = trip.price * dto.seatsCount;

      const booking = await tx.booking.create({
        data: {
          userId,
          tripId: dto.tripId,
          companyId: trip.companyId,
          seatsCount: dto.seatsCount,
          seatNumbers: dto.seatNumbers ?? [],
          totalPrice,
          status: 'PENDING',
        },
        include: {
          trip: {
            include: { bus: { select: { type: true } }, company: { select: { name: true } } },
          },
        },
      });

      // Decrement available seats
      await tx.trip.update({
        where: { id: dto.tripId },
        data: { availableSeats: { decrement: dto.seatsCount } },
      });

      return booking;
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.booking.findMany({
      where: companyId ? { companyId } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        trip: { select: { origin: true, destination: true, departureAt: true } },
        payment: { select: { status: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        trip: { include: { bus: true, company: { select: { name: true, phone: true } } } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancel(id: string, userId: string, role: string) {
    const booking = await this.findOne(id);

    if (role === 'PASSENGER' && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking already cancelled');
    }
    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id: booking.tripId },
        data: { availableSeats: { increment: booking.seatsCount } },
      });

      return tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }

  async confirm(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }
}
