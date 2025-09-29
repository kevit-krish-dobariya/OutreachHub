import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/role.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('admin', 'editor', 'viewer')
  @Get('stats/:workspaceId')
  async getStats(@Param('workspaceId') workspaceId: string) {
    return this.dashboardService.getStats(workspaceId);
  }

  @Roles('admin', 'editor', 'viewer')
  @Get('campaigns-per-day/:workspaceId')
  async getCampaignsPerDay(
    @Param('workspaceId') workspaceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getCampaignsPerDay(workspaceId, startDate, endDate);
  }

  @Roles('admin', 'editor', 'viewer')
  @Get('messages-per-day/:workspaceId')
  async getMessagesPerDay(
    @Param('workspaceId') workspaceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getMessagesPerDay(workspaceId, startDate, endDate);
  }

  @Roles('admin', 'editor', 'viewer')
  @Get('contacts-reached/:workspaceId')
  async getContactsReached(
    @Param('workspaceId') workspaceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getContactsReached(workspaceId, startDate, endDate);
  }
}

