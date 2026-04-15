import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateBusDto) {
    return this.prisma.bus.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.bus.findMany({
      where: companyId ? { companyId } : {},
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { trips: true } },
      },
    });
  }

  async findOne(id: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        trips: { orderBy: { departureAt: 'desc' }, take: 10 },
      },
    });
    if (!bus) throw new NotFoundException('Bus not found');
    return bus;
  }

  async update(id: string, companyId: string, role: string, dto: UpdateBusDto) {
    const bus = await this.findOne(id);
    if (role !== 'SUPER_ADMIN' && bus.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.bus.update({ where: { id }, data: dto });
  }

  async remove(id: string, companyId: string, role: string) {
    const bus = await this.findOne(id);
    if (role !== 'SUPER_ADMIN' && bus.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }
    await this.prisma.bus.delete({ where: { id } });
    return { message: 'Bus deleted successfully' };
  }
}
