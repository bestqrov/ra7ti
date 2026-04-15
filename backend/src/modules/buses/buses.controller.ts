import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@ApiTags('Buses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('buses')
export class BusesController {
  constructor(private busesService: BusesService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add a bus to company fleet' })
  create(@CurrentUser() user: any, @Body() dto: CreateBusDto) {
    const companyId = user.role === 'SUPER_ADMIN' ? dto['companyId'] : user.companyId;
    return this.busesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List buses (filter by company)' })
  @ApiQuery({ name: 'companyId', required: false })
  findAll(@Query('companyId') companyId?: string) {
    return this.busesService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bus' })
  findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a bus' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateBusDto,
  ) {
    return this.busesService.update(id, user.companyId, user.role, dto);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a bus' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.busesService.remove(id, user.companyId, user.role);
  }
}
