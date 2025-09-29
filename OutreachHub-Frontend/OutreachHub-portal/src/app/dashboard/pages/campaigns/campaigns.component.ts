import { Component, OnInit } from '@angular/core';
import { CampaignsService } from '../../../core/services/campaign.service';
import { TemplatesService } from '../../../core/services/template.service';
import { AuthService } from '../../../core/services/auth.service';
import { Campaign } from '../../../core/interfaces/campaign.interface';
import { Template } from '../../../core/interfaces/template.interface';
import { Contact } from '../../../core/interfaces/contact.interface';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html'
})
export class CampaignsComponent implements OnInit {
  campaigns: Campaign[] = [];
  templates: Template[] = [];
  tags: string[] = [];
  targetContacts: Contact[] = [];
  isEditor = false;

  showModal = false;
  showDeleteModal = false;
   showContactsModal = false; // ✅ New: s
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedCampaign: Campaign | null = null;
    selectedContact: Contact | null = null; // ✅ New: single contact details for info popup

  charCount = 0;
  startNow = false;

   // --- ADDED: Pagination State ---
  paginatedCampaigns: Campaign[] = [];
  currentPage = 1;
  readonly pageSize = 10; // You can adjust the number of items per page
  totalPages = 0;

  constructor(
    private campaignService: CampaignsService,
    private templateService: TemplatesService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isEditor = this.auth.getUserRole() === 'editor';
    this.loadCampaigns();
    this.loadTemplates();
    setInterval(() => this.loadCampaigns(), 30000);
  }

  /** Load campaigns from API */
//   loadCampaigns(): void {
//   //const wsId = this.getWorkspaceId();
//   this.campaignService.getCampaigns().subscribe({
//     next: (data) => {
//       this.campaigns = data.map(c => this.evaluateStatus(c));
//     },
//     error: (err) => console.error('Error fetching campaigns:', err)
//   });
// }

// 
loadCampaigns(): void {
  const wsId = this.getWorkspaceId();

  this.campaignService.getCampaigns().subscribe({
    next: (data) => {
      this.campaigns = data.map(c =>
        this.evaluateStatus({
          ...c,
          targetedContacts: c.targetedContacts ?? [], // always array
          contacts: c.contacts ?? []                  // ensure defined
        })
      );

       // --- ADDED: Initialize Pagination ---
        this.totalPages = Math.ceil(this.campaigns.length / this.pageSize);
        this.updatePagination();

      // Fetch and store audience per campaign
      this.campaigns.forEach(campaign => {
        if (campaign.selectedTags && campaign.selectedTags.length > 0) {
          this.campaignService.getTargetContacts(wsId, campaign.selectedTags).subscribe({
            next: (contacts: Contact[]) => {
              campaign.audience = contacts.length;
              campaign.targetedContacts = contacts;
              campaign.contacts = contacts; // ✅ always set contacts
            },
            error: (err) => console.error(`Error fetching audience for ${campaign._id}:`, err)
          });
        } else {
          campaign.audience = 0;
          campaign.targetedContacts = [];
          campaign.contacts = []; // ✅ make sure contacts exists
        }
      });
    },
    error: (err) => console.error('Error fetching campaigns:', err)
  });
}

  private getWorkspaceId(): string {
    return this.auth.getActiveWorkspace() || this.auth.getWorkspaceId() || '';
  }

  private evaluateStatus(campaign: Campaign): Campaign {
  const now = new Date();

  const start = new Date(`${campaign.startDate}T${campaign.startTime}`);
  const end = new Date(`${campaign.endDate}T${campaign.endTime}`);

  if (now < start) {
    campaign.status = 'Draft';
  } else if (now >= start && now <= end) {
    campaign.status = 'Running';
  } else if (now > end) {
    campaign.status = 'Completed';
  }

  return campaign;
}

 // --- ADDED: All Pagination Methods ---

  /** Calculates the starting index for the current page's slice. */
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  /** Calculates the ending index for the current page's slice. */
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.campaigns.length);
  }

  /** Slices the main campaigns array to get the items for the current page. */
  updatePagination(): void {
    this.paginatedCampaigns = this.campaigns.slice(this.startIndex, this.endIndex);
  }

  /** Navigates to the next page. */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /** Navigates to the previous page. */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  // ------------------------------------

  
  
  /** Load templates from API */
  loadTemplates(): void {
    this.templateService.getTemplates().subscribe({
      next: (data: Template[]) => (this.templates = data),
      error: (err) => console.error('Error fetching templates:', err)
    });
  }

  /** Open modal for creating new campaign */
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedCampaign = null;
    this.tags = [];
    this.targetContacts = [];
    this.showModal = true;
  }

  /** Open modal for editing campaign */
  editCampaign(campaign: Campaign): void {
    this.modalMode = 'edit';
    this.selectedCampaign = { ...campaign };
    this.tags = campaign.selectedTags ? [...campaign.selectedTags] : [];
    this.fetchTargetContacts();
    this.showModal = true;
  }

  /** Open modal for viewing campaign */
  viewCampaign(campaign: Campaign): void {
    this.modalMode = 'view';
    this.selectedCampaign = campaign;
    this.tags = campaign.selectedTags ? [...campaign.selectedTags] : [];
    this.fetchTargetContacts();
    this.showModal = true;
  }

  /** Close any modal */
  closeModal(): void {
    this.showModal = false;
    this.selectedCampaign = null;
    this.tags = [];
    this.targetContacts = [];
    this.charCount = 0;
    this.startNow = false;
  }

  /** Create or update campaign */
  saveCampaign(): void {
    const wsId = this.getWorkspaceId();
    const userId = this.auth.getUserId();

    // Helper function to get value from an input element
    const getInputValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value;

    const campaignPayload: Partial<Campaign> = {
      name: getInputValue('campaign-name'),
      description: (document.getElementById('campaign-description') as HTMLTextAreaElement)?.value || '',
      status: this.startNow ? 'Running' : 'Draft',
      selectedTags: this.tags,
      templateId: (document.getElementById('templates') as HTMLSelectElement).value,
      startDate: getInputValue('start-date'),
      startTime: getInputValue('start-time'),
      endDate: getInputValue('end-date'),
      endTime: getInputValue('end-time'),
    };
    
    
    if (!this.selectedCampaign) {
      // Create new campaign
      const newCampaign: Campaign = {
        ...campaignPayload as Campaign,
        workspaceId: wsId,
        createdBy: userId ?? ''
      };

      this.campaignService.addCampaign(newCampaign).subscribe({
        next: (res) => {
          this.campaigns.push(res);
          this.closeModal();

          if (res.status === 'Running') {
            this.startCampaign(res);
          }
        },
        error: (err) => console.error('Error creating campaign:', err)
      });
    } else {
      // Update existing campaign
      this.campaignService.updateCampaign(this.selectedCampaign._id!, campaignPayload).subscribe({
        next: (res) => {
          const idx = this.campaigns.findIndex(c => c._id === res._id);
          if (idx !== -1) this.campaigns[idx] = res;
          this.closeModal();
        },
        error: (err) => console.error('Error updating campaign:', err)
      });
    }
  }

  /** Start a draft campaign */
  startCampaign(campaign: Campaign): void {
    const wsId = this.getWorkspaceId();

    this.campaignService.updateCampaign(campaign._id!, { ...campaign, status: 'Running' }).subscribe({
      next: (res) => {
        const idx = this.campaigns.findIndex(c => c._id === res._id);
        if (idx !== -1) this.campaigns[idx] = res;

        // Fetch contacts by tags
        this.campaignService.getTargetContacts(wsId, res.selectedTags!).subscribe({
          next: (contacts: Contact[]) => {
            const template = this.templates.find(t => t._id === res.templateId);
            let messageContent = '';

            if (typeof template?.message === 'string') {
              messageContent = template.message;
            } else if (template?.message) {
              messageContent = template.message.text;
              if (template.message.imageUrl) {
                messageContent += ` [Image: ${template.message.imageUrl}]`;
              }
            }

            const payload = {
              contactIds: contacts.map(c => c._id!),
              messageContent
            };

            this.campaignService.sendCampaignMessage(wsId, res._id!, payload).subscribe({
              next: () => console.log('Campaign messages sent'),
              error: (err) => console.error('Error sending messages:', err)
            });
          },
          error: (err) => console.error('Error fetching target contacts:', err)
        });
      },
      error: (err) => console.error('Error starting campaign:', err)
    });
  }

  /** Delete campaign */
  deleteCampaign(campaign: Campaign): void {
    this.selectedCampaign = campaign;
    this.showDeleteModal = true;
  }

  /** Confirm deletion */
  confirmDelete(): void {
    if (!this.selectedCampaign?._id) return;
    this.campaignService.deleteCampaign(this.selectedCampaign._id).subscribe({
      next: () => {
        this.campaigns = this.campaigns.filter(c => c._id !== this.selectedCampaign?._id);
        this.showDeleteModal = false;
      },
      error: (err) => console.error('Error deleting campaign:', err)
    });
  }

  /** Cancel deletion */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedCampaign = null;
  }

  openContactsModal(campaign: Campaign): void {
  this.selectedCampaign = {
    ...campaign,
    contacts: campaign.contacts ?? [] // ✅ safe default
  };
  this.showContactsModal = true;

  this.fetchCampaignContacts(campaign);
}

  /** ✅ Close contacts modal */
  closeContactsModal(): void {
    this.showContactsModal = false;
    this.selectedCampaign = null;
    this.targetContacts = [];
  }

   private fetchCampaignContacts(campaign: Campaign): void {
  const wsId = this.getWorkspaceId();
  if (!campaign.selectedTags || campaign.selectedTags.length === 0) {
    this.targetContacts = [];
    if (this.selectedCampaign) {
      this.selectedCampaign.contacts = []; // ✅ ensure defined
    }
    return;
  }

    this.campaignService.getTargetContacts(wsId, campaign.selectedTags).subscribe({
    next: (contacts: Contact[]) => {
      this.targetContacts = contacts;
      if (this.selectedCampaign) {
        this.selectedCampaign.contacts = contacts; // ✅ assign here too
      }
    },
    error: (err) => console.error(`Error fetching contacts for ${campaign._id}:`, err)
  });
}


  /** ✅ Get unique audience size across all campaigns */
  getUniqueAudienceSize(): number {
    const unique = new Set<string>();
    this.campaigns.forEach(c => (c.targetedContacts || []).forEach(ct => unique.add(ct._id!)));
    return unique.size;
  }


  /** Add tag and fetch contacts */
  addTag(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      this.fetchTargetContacts();
    }
    input.value = '';
  }

  /** Remove tag and fetch contacts */
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.fetchTargetContacts();
  }

  /** Fetch contacts based on selected tags */
  private fetchTargetContacts(): void {
    const wsId = this.getWorkspaceId();
    if (this.tags.length === 0) {
      this.targetContacts = [];
      return;
    }

    this.campaignService.getTargetContacts(wsId, this.tags).subscribe({
      next: (contacts: Contact[]) => (this.targetContacts = contacts),
      error: (err) => console.error('Error fetching target contacts:', err)
    });
  }

  /** Update character count for description */
  updateCharCount(event: Event): void {
    this.charCount = (event.target as HTMLTextAreaElement).value.length;
  }

  /** ngFor trackBy */
  trackById(index: number, item: Campaign): string {
    return item._id || index.toString();
  }

  // ---------------- Stats Cards ----------------

  totalOngoingCampaigns(): number {
    return this.campaigns.filter(c => c.status === 'Running').length;
  }

  totalEndedCampaigns(): number {
    return this.campaigns.filter(c => c.status === 'Completed' || c.status === 'Failed').length;
  }

totalTargetedAudience(): number {
  const uniqueContacts = new Set<string>();

  this.campaigns.forEach(campaign => {
    (campaign.targetedContacts || []).forEach(c => uniqueContacts.add(c._id!));
  });

  return uniqueContacts.size;
}

  totalTagsTargeted(): number {
    const allTags = this.campaigns.flatMap(c => c.selectedTags || []);
    return new Set(allTags).size;
  }

  /** Get template name by ID */
  getTemplateName(templateId: string): string {
    const template = this.templates.find(t => t._id === templateId);
    return template ? template.name : 'Unknown Template';
  }

  /** Get full template details */
  getTemplateDetails(templateId: string) {
    return this.templates.find(t => t._id === templateId);
  }
}
