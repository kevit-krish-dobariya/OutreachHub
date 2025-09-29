import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/roles/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin-dashboard')
export class AdminDashboardController {
     constructor(private readonly adminDashboardService: AdminDashboardService) {}

  /**
   * Provides all the summary statistics needed for the admin dashboard cards.
   */
  @Get('stats')
  @Roles('admin')
  async getStats() {
    return this.adminDashboardService.getAdminStats();
  }

  /**
   * Provides aggregated data for the "User Growth" chart.
   */
  @Get('user-growth')
  @Roles('admin')
  async getUserGrowth() {
    return this.adminDashboardService.getUserGrowthPerDay();
  }

  /**
   * Provides aggregated data for the "Campaign Performance" chart.
   */
  @Get('campaign-performance')
  @Roles('admin')
  async getCampaignPerformance() {
    return this.adminDashboardService.getCampaignsPerDay();
  }

   @Get('recent-activities')
  @Roles('admin')
  async getRecentActivities() {
    return this.adminDashboardService.getRecentActivities();
  }
}
