import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Observable, forkJoin, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Contact } from '../../../core/interfaces/contact.interface';
import { Campaign } from '../../../core/interfaces/campaign.interface';
import { Template } from '../../../core/interfaces/template.interface';
import { ContactsService } from '../../../core/services/contacts.service';
import { CampaignsService } from '../../../core/services/campaign.service';
import { TemplatesService } from '../../../core/services/template.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public userName: string = '';

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
    private authService: AuthService
  ) {}

  ngOnInit() {
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
  campaignsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [12, 19, 3, 5, 2, 3, 7], label: 'Campaigns', backgroundColor: '#6366f1' }]
  };

  messagesChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Email', 'SMS', 'WhatsApp', 'LinkedIn'],
    datasets: [
      { data: [120, 90, 60, 30], label: 'Messages Sent', borderColor: '#f59e42', backgroundColor: 'rgba(245,158,66,0.2)', fill: true }
    ]
  };

  contactsChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [50, 60, 70, 80, 90, 100, 110], label: 'Contacts Reached', borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)', fill: true }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: { x: {}, y: { beginAtZero: true } }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } }
  };
}
