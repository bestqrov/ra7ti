import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BoostService } from './boost.service';
import { CreateBoostDto } from './dto/create-boost.dto';

@ApiTags('Boost')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('boosts')
export class BoostController {
  constructor(private boostService: BoostService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Company] Boost a trip – promotes it to top of search results',
  })
  create(@CurrentUser() user: any, @Body() dto: CreateBoostDto) {
    return this.boostService.create(user.companyId, dto);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List boosts (company sees own, admin sees all)' })
  findAll(@CurrentUser() user: any) {
    const companyId = user.role === 'COMPANY_ADMIN' ? user.companyId : undefined;
    return this.boostService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get boost details' })
  findOne(@Param('id') id: string) {
    return this.boostService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cancel an active boost' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.boostService.cancel(id, user.companyId, user.role);
  }

  @Post('expire')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Manually trigger boost expiry sweep' })
  expire() {
    return this.boostService.expireStaleBoosts();
  }
}
