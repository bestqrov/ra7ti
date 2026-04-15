import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { SearchTripDto } from './dto/search-trip.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTripDto) {
    // Verify bus belongs to company
    const bus = await this.prisma.bus.findFirst({
      where: { id: dto.busId, companyId, isActive: true },
    });
    if (!bus) throw new BadRequestException('Bus not found in your fleet');

    if (dto.availableSeats > bus.capacity) {
      throw new BadRequestException(
        `Available seats cannot exceed bus capacity of ${bus.capacity}`,
      );
    }

    return this.prisma.trip.create({
      data: {
        ...dto,
        departureAt: new Date(dto.departureAt),
        arrivalAt: new Date(dto.arrivalAt),
        companyId,
      },
      include: {
        bus: { select: { plateNumber: true, type: true } },
        company: { select: { id: true, name: true } },
      },
    });
  }

  async search(dto: SearchTripDto) {
    const { origin, destination, date, seats, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      status: { in: ['SCHEDULED', 'ACTIVE'] },
    };

    if (origin) where.origin = { contains: origin, mode: 'insensitive' };
    if (destination)
      where.destination = { contains: destination, mode: 'insensitive' };
    if (seats) where.availableSeats = { gte: seats };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.departureAt = { gte: start, lte: end };
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isBoosted: 'desc' }, { departureAt: 'asc' }],
        include: {
          bus: { select: { type: true, amenities: true } },
          company: { select: { id: true, name: true, logo: true } },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      trips,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        bus: true,
        company: { select: { id: true, name: true, logo: true, phone: true } },
        _count: { select: { bookings: true } },
      },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async findByCompany(companyId: string) {
    return this.prisma.trip.findMany({
      where: { companyId },
      include: {
        bus: { select: { plateNumber: true, type: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { departureAt: 'desc' },
    });
  }

  async update(id: string, companyId: string, role: string, dto: UpdateTripDto) {
    const trip = await this.findOne(id);
    if (role !== 'SUPER_ADMIN' && trip.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }

    const data: any = { ...dto };
    if (dto.departureAt) data.departureAt = new Date(dto.departureAt);
    if (dto.arrivalAt) data.arrivalAt = new Date(dto.arrivalAt);

    return this.prisma.trip.update({ where: { id }, data });
  }

  async cancel(id: string, companyId: string, role: string) {
    const trip = await this.findOne(id);
    if (role !== 'SUPER_ADMIN' && trip.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.trip.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
