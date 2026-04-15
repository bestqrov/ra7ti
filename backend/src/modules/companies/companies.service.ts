import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const exists = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Company email already registered');

    return this.prisma.company.create({ data: dto });
  }

  async findAll() {
    return this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        logo: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
        _count: { select: { buses: true, trips: true } },
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { _count: { select: { buses: true, trips: true, bookings: true } } },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.company.delete({ where: { id } });
    return { message: 'Company deleted successfully' };
  }

  async stats(companyId: string) {
    const [trips, bookings, revenue] = await Promise.all([
      this.prisma.trip.count({ where: { companyId } }),
      this.prisma.booking.count({ where: { companyId } }),
      this.prisma.payment.aggregate({
        where: { companyId, status: 'COMPLETED' },
        _sum: { netAmount: true, commissionAmount: true },
      }),
    ]);

    return {
      totalTrips: trips,
      totalBookings: bookings,
      totalRevenue: revenue._sum.netAmount ?? 0,
      totalCommission: revenue._sum.commissionAmount ?? 0,
    };
  }
}
