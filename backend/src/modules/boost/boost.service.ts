import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BoostPackage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoostDto } from './dto/create-boost.dto';

/** Boost pricing and durations */
const BOOST_CONFIG: Record<BoostPackage, { hours: number; price: number }> = {
  BASIC: {
    hours: 24,
    price: parseFloat(process.env.BOOST_BASIC_PRICE ?? '5'),
  },
  STANDARD: {
    hours: 72,
    price: parseFloat(process.env.BOOST_STANDARD_PRICE ?? '12'),
  },
  PREMIUM: {
    hours: 24 * 7,
    price: parseFloat(process.env.BOOST_PREMIUM_PRICE ?? '25'),
  },
};

@Injectable()
export class BoostService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateBoostDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId } });

    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.companyId !== companyId) throw new ForbiddenException('Access denied');
    if (trip.status === 'CANCELLED' || trip.status === 'COMPLETED') {
      throw new BadRequestException('Cannot boost a cancelled or completed trip');
    }
    if (trip.isBoosted) {
      throw new BadRequestException('Trip already has an active boost');
    }

    const { hours, price } = BOOST_CONFIG[dto.package];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const boost = await tx.boost.create({
        data: {
          tripId: dto.tripId,
          companyId,
          package: dto.package,
          price,
          startsAt: now,
          expiresAt,
          status: 'ACTIVE',
        },
      });

      await tx.trip.update({
        where: { id: dto.tripId },
        data: { isBoosted: true, boostExpiresAt: expiresAt },
      });

      return boost;
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.boost.findMany({
      where: companyId ? { companyId } : {},
      include: {
        trip: { select: { origin: true, destination: true, departureAt: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const boost = await this.prisma.boost.findUnique({
      where: { id },
      include: { trip: true, company: { select: { name: true } } },
    });
    if (!boost) throw new NotFoundException('Boost not found');
    return boost;
  }

  async cancel(id: string, companyId: string, role: string) {
    const boost = await this.findOne(id);

    if (role !== 'SUPER_ADMIN' && boost.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    if (boost.status !== 'ACTIVE') {
      throw new BadRequestException('Only active boosts can be cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id: boost.tripId },
        data: { isBoosted: false, boostExpiresAt: null },
      });

      return tx.boost.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }

  /**
   * Cron-style: expire boosts whose expiresAt has passed.
   * Call this from a scheduled job (e.g. every 5 minutes).
   */
  async expireStaleBoosts() {
    const now = new Date();

    const expired = await this.prisma.boost.findMany({
      where: { status: 'ACTIVE', expiresAt: { lte: now } },
    });

    if (expired.length === 0) return { expired: 0 };

    await this.prisma.$transaction([
      this.prisma.boost.updateMany({
        where: { id: { in: expired.map((b) => b.id) } },
        data: { status: 'EXPIRED' },
      }),
      this.prisma.trip.updateMany({
        where: { id: { in: expired.map((b) => b.tripId) } },
        data: { isBoosted: false, boostExpiresAt: null },
      }),
    ]);

    return { expired: expired.length };
  }
}
