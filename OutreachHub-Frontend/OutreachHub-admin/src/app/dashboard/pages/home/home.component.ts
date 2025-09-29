import { Component, OnInit } from '@angular/core';
import { Activity, AdminDashboardService, AdminStats, ChartData } from '../../../core/service/dashboard.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Color, ScaleType } from '@swimlane/ngx-charts';

// Interface for the data format expected by the ngx-charts library
interface NgxChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // --- STATE PROPERTIES ---
  stats: AdminStats = {
    totalWorkspaces: 0,
    totalUsers: 0,
    totalCampaigns: 0,
    totalMessages: 0,
  };
  recentActivities: Activity[] = [];
  userGrowth: NgxChartData[] = [];
  campaignPerformance: NgxChartData[] = [];

  // --- CHART OPTIONS & STYLING ---
  view: [number, number] = [500, 300];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  userGrowthColorScheme: Color = {
    name: 'userGrowth',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2563eb'], // Blue color
  };
  campaignPerformanceColorScheme: Color = {
    name: 'campaignPerf',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ec4899', '#f87171', '#fbbf24', '#ef4444'] // Shades of pink, red, yellow
  };

  // --- LIFECYCLE HOOKS ---

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // --- DATA FETCHING ---

  /**
   * Fetches all necessary data for the dashboard cards, charts, and activity table concurrently.
   */
  loadDashboardData(): void {
    forkJoin({
      stats: this.adminDashboardService.getStats(),
      recentActivities: this.adminDashboardService.getRecentActivities(),
      userGrowth: this.adminDashboardService.getUserGrowth(),
      campaignPerformance: this.adminDashboardService.getCampaignPerformance()
    }).pipe(
      // Transform the chart data into the format required by ngx-charts
      map(({ stats, recentActivities, userGrowth, campaignPerformance }) => ({
        stats,
        recentActivities,
        userGrowth: this.transformToNgxChartData(userGrowth),
        campaignPerformance: this.transformToNgxChartData(campaignPerformance)
      }))
    ).subscribe(({ stats, recentActivities, userGrowth, campaignPerformance }) => {
      // Assign all fetched data at once
      this.stats = stats;
      this.recentActivities = recentActivities;
      this.userGrowth = userGrowth;
      this.campaignPerformance = campaignPerformance;
    });
  }

  // --- PRIVATE HELPER METHODS ---

  /**
   * Converts the API's ChartData format to the { name, value } object
   * format required by the ngx-charts library.
   * @param chartData The data received from the API.
   * @returns An array formatted for ngx-charts.
   */
  private transformToNgxChartData(chartData: ChartData): NgxChartData[] {
    if (!chartData?.labels || !chartData.datasets?.[0]?.data) {
      return [];
    }
    return chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.datasets[0].data[index]
    }));
  }
}

