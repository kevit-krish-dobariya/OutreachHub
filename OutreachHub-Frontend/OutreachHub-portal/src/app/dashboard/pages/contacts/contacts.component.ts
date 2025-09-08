import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ContactsService } from '../../../core/services/contacts.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})

export class ContactsComponent implements OnInit {
  allContacts: any[] = [];   // store original data
  contacts: any[] = [];      // filtered data
  paginatedContacts: any[] = [];
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
 selectedContact: any = null;
 contactForm = {
  name: '',
  email: '',
  phoneNumber: '',
  tags: ''
};
editingContact: any = null;



  currentPage = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 0;

  searchQuery = '';
  filters = { date: '', tag: '' };
  tags: string[] = [];

  isEditor = false;

  constructor(private contactsService: ContactsService, private auth: AuthService) {}

  ngOnInit() {
    this.isEditor = this.auth.getUserRole() === 'editor';
    this.loadContacts();
  }

  loadContacts() {
    this.contactsService.getContacts().subscribe((res: any) => {
      this.allContacts = res;
      this.contacts = [...this.allContacts]; // reset filters
      this.tags = [
        ...new Set(
          this.allContacts.flatMap(c => (c.tags ? c.tags : []))
        ),
      ];
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  /** Pagination **/
  updatePagination() {
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.contacts.length);
    this.paginatedContacts = this.contacts.slice(this.startIndex, this.endIndex);
  }

  nextPage() {
    if (this.endIndex < this.contacts.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /** Search + Filters **/
  applySearch() {
    let filtered = this.allContacts.filter(c =>
      (c.name?.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (c.email?.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (c.phoneNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );

    if (this.filters.tag) {
      filtered = filtered.filter(c => c.tags?.includes(this.filters.tag));
    }

    if (this.filters.date === 'asc') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.filters.date === 'desc') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    this.contacts = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Delete **/
  deleteContact(id: string) {
    this.contactsService.deleteContact(id).subscribe(() => {
      this.allContacts = this.allContacts.filter(c => c._id !== id);
      this.contacts = this.contacts.filter(c => c._id !== id);
      this.updatePagination();
    });
  }

  /** CSV Import **/
  importCSV(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.contactsService.importCSV(file).subscribe(() => {
        this.loadContacts();
      });
    }
  }

  openAddContact() {
  this.modalMode = 'add';
  this.selectedContact = {
    name: '',
    email: '',
    phoneNumber: '',
    tags: []
  };
  this.showModal = true;
}

editContact(contact: any) {
  this.modalMode = 'edit';
  // clone contact so editing form doesn’t directly mutate table data
  this.selectedContact = { ...contact, tags: [...(contact.tags || [])] };
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
  this.selectedContact = null;
}

saveContact() {
  if (!this.selectedContact) return;

  if (this.modalMode === 'add') {
    this.contactsService.addContact(this.selectedContact).subscribe((newContact: any) => {
      this.allContacts.unshift(newContact); // add to list
      this.contacts = [...this.allContacts];
      this.updatePagination();
      this.closeModal();
    });
  } else if (this.modalMode === 'edit' && this.selectedContact._id) {
    this.contactsService.updateContact(this.selectedContact._id, this.selectedContact).subscribe((updated: any) => {
      // update contact in allContacts
      const index = this.allContacts.findIndex(c => c._id === updated._id);
      if (index !== -1) {
        this.allContacts[index] = updated;
      }
      this.contacts = [...this.allContacts];
      this.updatePagination();
      this.closeModal();
    });
  }
}
}
