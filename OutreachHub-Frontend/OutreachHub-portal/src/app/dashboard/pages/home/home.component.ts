import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Observable, Subscription, forkJoin, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Contact } from '../../../core/interfaces/contact.interface';
import { Campaign } from '../../../core/interfaces/campaign.interface';
import { Template } from '../../../core/interfaces/template.interface';
import { ContactsService } from '../../../core/services/contacts.service';
import { CampaignsService } from '../../../core/services/campaign.service';
import { TemplatesService } from '../../../core/services/template.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { DashboardService, ChartData } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public userName: string = '';
   isDarkMode = false;
  private themeSubscription!: Subscription;

  contacts$!: Observable<Contact[]>;
  campaigns$!: Observable<Campaign[]>;
  templates$!: Observable<Template[]>;

  // Date range models for charts 
   campaignsDateRange: string = ''; 
   messagesDateRange: string = ''; 
   contactsDateRange: string = '';

   // Summary cards
  totalCampaigns = 0;
  totalAudience = 0;
  totalMessages = 0;

  constructor(
    private contactsService: ContactsService,
    private campaignsService: CampaignsService,
    private templatesService: TemplatesService,
    private authService: AuthService,
    private themeService: ThemeService,
     private dashboardService: DashboardService
  ) {}

  ngOnInit() {

     // Subscribe to theme changes to update the icon
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = (theme === 'dark');
      });
    // Fetch logged-in user
    const userStr = localStorage.getItem('user');
    this.userName = userStr ? JSON.parse(userStr)?.username || 'User' : 'User';


    const wsId = this.getWorkspaceId();

    // Polling campaigns with audience & contacts every 10s
    
    this.campaigns$ = timer(0, 10000).pipe(
      switchMap(() => this.campaignsService.getCampaigns()),
      switchMap(campaigns => {
        const campaignsWithAudience$ = campaigns.map(campaign => {
          const tags = campaign.selectedTags || [];
          if (tags.length > 0) {
            return this.campaignsService.getTargetContacts(wsId, tags).pipe(
              map((contacts: Contact[]) => ({
                ...campaign,
                targetedContacts: contacts,
                audience: contacts.length,
                status: this.evaluateStatus(campaign)
              }))
            );
          } else {
            return new Observable<Campaign>(observer => {
              observer.next({
                ...campaign,
                targetedContacts: [],
                audience: 0,
                status: this.evaluateStatus(campaign)
              });
              observer.complete();
            });
          }
        });

        return forkJoin(campaignsWithAudience$);
      })
    );

    // Poll contacts (all) every 10s
    this.contacts$ = timer(0, 10000).pipe(
      switchMap(() => this.contactsService.getContacts())
    );

    // Fetch templates for mapping template names
    this.templates$ = timer(0, 10000).pipe(
      switchMap(() => this.templatesService.getTemplates())
    );

     this.loadDashboardData();
  
 
  }

  loadDashboardData(): void {
    const wsId = this.getWorkspaceId();
  // Fetch summary card stats
  this.dashboardService.getStats(wsId).subscribe(stats => {
    this.totalCampaigns = stats.totalCampaigns;
    this.totalAudience = stats.totalAudience;
    this.totalMessages = stats.totalMessages;
  });

  // Set a default date range (e.g., last 30 days) and fetch chart data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  this.campaignsDateRange = endStr; // Bind this to your date input
  this.messagesDateRange = endStr; // Bind this to your date input
  this.contactsDateRange = endStr; // Bind this to your date input

  this.onCampaignsDateChange(startStr, endStr);
  this.onMessagesDateChange(startStr, endStr);
  this.onContactsDateChange(startStr, endStr);
}

/**
 * Methods to update charts when the user selects a new date range.
 */
onCampaignsDateChange(start: string, end: string): void {
  this.dashboardService.getCampaignsPerDay(this.getWorkspaceId(), start, end).subscribe(data => {
    this.campaignsChartData = data;
  });
}

onMessagesDateChange(start: string, end: string): void {
  this.dashboardService.getMessagesPerDay(this.getWorkspaceId(), start, end).subscribe(data => {
    this.messagesChartData = data;
  });
}

onContactsDateChange(start: string, end: string): void {
  this.dashboardService.getContactsReached(this.getWorkspaceId(), start, end).subscribe(data => {
    this.contactsChartData = data;
  });
}

updateCampaignsChart(): void {
    const endDate = new Date(this.campaignsDateRange);
    const startDate = new Date(this.campaignsDateRange);
    startDate.setDate(endDate.getDate() - 30);
    this.onCampaignsDateChange(startDate.toISOString().split('T')[0], this.campaignsDateRange);
  }

  /**
   * Re-fetches messages chart data for a 30-day period ending on the selected date.
   */
  updateMessagesChart(): void {
    const endDate = new Date(this.messagesDateRange);
    const startDate = new Date(this.messagesDateRange);
    startDate.setDate(endDate.getDate() - 30);
    this.onMessagesDateChange(startDate.toISOString().split('T')[0], this.messagesDateRange);
  }

  /**
   * Re-fetches contacts chart data for a 30-day period ending on the selected date.
   */
  updateContactsChart(): void {
    const endDate = new Date(this.contactsDateRange);
    const startDate = new Date(this.contactsDateRange);
    startDate.setDate(endDate.getDate() - 30);
    this.onContactsDateChange(startDate.toISOString().split('T')[0], this.contactsDateRange);
  }

  private getWorkspaceId(): string {
    return this.authService.getActiveWorkspace() || this.authService.getWorkspaceId() || '';
  }

  /** Evaluate campaign status based on start/end date/time */
  private evaluateStatus(campaign: Campaign): string {
    const now = new Date();
    const start = new Date(`${campaign.startDate}T${campaign.startTime}`);
    const end = new Date(`${campaign.endDate}T${campaign.endTime}`);

    if (now < start) return 'Draft';
    if (now >= start && now <= end) return 'Running';
    return 'Completed';
  }

  /** Get template name by ID */
  public getTemplateName(templateId: string, templates: Template[]): string {
    const template = templates.find(t => t._id === templateId);
    return template ? template.name : 'Unknown Template';
  }

  /** Total unique audience across all campaigns */
  public totalTargetedAudience(campaigns: Campaign[]): number {
    const unique = new Set<string>();
    campaigns.forEach(c => (c.targetedContacts || []).forEach(ct => unique.add(ct._id!)));
    return unique.size;
  }

  // ------------------- Chart Data -------------------
campaignsChartData: ChartData = { labels: [], datasets: [], };
messagesChartData: ChartData = { labels: [], datasets: [] };
contactsChartData: ChartData = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: { x: {}, y: { beginAtZero: true } }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } }
  };

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Toggles the application's theme between light and dark mode.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
