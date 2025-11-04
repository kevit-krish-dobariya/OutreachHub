import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ContactsService } from '../../../core/services/contacts.service';
import { Contact } from '../../../core/interfaces/contact.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  allContacts: Contact[] = [];
  contacts: Contact[] = [];
  paginatedContacts: Contact[] = [];

  // Add/Edit Modal state
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedContact: Contact = this.createEmptyContact();

  // Confirmation Modal state
  showConfirmModal = false;
  contactToDelete: Contact | null = null;

  // Info Modal state
  showInfoModal = false;
  infoMessage = '';

  // Pagination state
  currentPage = 1;
  readonly pageSize = 10;
  totalPages = 0;

  // Search + filters
  searchQuery = '';
  filters = { date: '', tag: '' };
  tags: string[] = [];

  // Role check
  isEditor = false;

  constructor(
    private contactsService: ContactsService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isEditor = this.auth.getUserRole() === 'editor';
    this.loadContacts();
  }

  /** Load all contacts created by the logged-in user */
 async loadContacts(): Promise<void> {
  try {
    const workspaceId = this.auth.getActiveWorkspace() || this.auth.getWorkspaceId();
    if (!workspaceId) {
      console.error('No active workspace selected');
      return;
    }

    this.allContacts = await firstValueFrom(this.contactsService.getContacts());

    this.extractTags();
    this.applySearch(); // ✅ will reset filters + pagination
    this.totalPages = Math.ceil(this.contacts.length / this.pageSize);
    this.updatePagination(); // ✅ ensure fresh pagination
  } catch (err) {
    console.error('Error loading contacts:', err);
  }
}

  /** Extract unique tags from all contacts */
  private extractTags(): void {
    this.tags = [...new Set(this.allContacts.flatMap(c => c.tags || []))];
  }

  /** Pagination */
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.contacts.length);
  }

  updatePagination(): void {
    const startIndex = this.startIndex;
    const endIndex = this.endIndex;
    this.paginatedContacts = this.contacts.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /** Search + filter */
  applySearch(): void {
    let filtered = this.allContacts.filter(c =>
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (c.phoneNumber ?? '').toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    if (this.filters.tag) {
      filtered = filtered.filter(c => c.tags.includes(this.filters.tag));
    }

    if (this.filters.date === 'asc') {
      filtered.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (this.filters.date === 'desc') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    this.contacts = filtered;
    this.currentPage = 1;
    this.updatePagination();
    this.totalPages = Math.ceil(this.contacts.length / this.pageSize);
  }

  updateFilter(key: 'date' | 'tag', value: string): void {
    this.filters[key] = value;
    this.applySearch();
  }

  updateContactTags(tagsString: string): void {
    this.selectedContact.tags = tagsString.split(',').map(tag => tag.trim());
  }

  /** CRUD: Save Contact */
  async saveContact(): Promise<void> {
  try {
    const workspaceId = this.auth.getActiveWorkspace() || this.auth.getWorkspaceId();
    if (!workspaceId) {
      alert('No active workspace selected.');
      return;
    }

    if (this.modalMode === 'edit') {
      // ✅ Do NOT overwrite workspaceId here
      const { workspaceId: _, ...updateData } = this.selectedContact;
      await firstValueFrom(
        this.contactsService.updateContact(this.selectedContact._id!, updateData)
      );
      alert('Contact updated successfully!');
    } else {
      // ✅ Only add workspaceId for new contacts
      this.selectedContact.workspaceId = workspaceId;
      await firstValueFrom(
        this.contactsService.addContact(this.selectedContact)
      );
      alert('Contact added successfully!');
    }

    // ✅ Always refetch after save
    await this.loadContacts();
    this.closeModal();
  } catch (err: any) {
    console.error('Error saving contact:', err);
    alert('Failed to save contact.');
  }
}


  /** CRUD: Delete Contact */
  async performDelete(): Promise<void> {
    if (!this.contactToDelete || !this.contactToDelete._id) {
      console.error('No contact to delete');
      this.cancelDelete();
      return;
    }
    try {
      await firstValueFrom(this.contactsService.deleteContact(this.contactToDelete._id));
      this.showInfoModal = true;
      this.infoMessage = 'Contact deleted successfully!';

      // ✅ Always refetch
      await this.loadContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      this.showInfoModal = true;
      this.infoMessage = 'Failed to delete contact.';
    } finally {
      this.cancelDelete();
    }
  }

  confirmDelete(contact: Contact): void {
  this.contactToDelete = contact;
  this.showConfirmModal = true;
}

  /** Cancel delete modal */
  cancelDelete(): void {
    this.showConfirmModal = false;
    this.contactToDelete = null;
  }

  /** Modal open/close */
  openAddContact(): void {
    this.modalMode = 'add';
    this.selectedContact = this.createEmptyContact();
    this.showModal = true;
  }

  editContact(contact: Contact): void {
    this.modalMode = 'edit';
    this.selectedContact = { ...contact };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedContact = this.createEmptyContact();
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
    this.infoMessage = '';
  }

  /** Utility: create empty contact */
  private createEmptyContact(): Contact {
    return {
      _id: '',
      name: '',
      email: '',
      phoneNumber: '',
      tags: [],
      workspaceId: '',
      createdBy: ''
    };
  }
}
