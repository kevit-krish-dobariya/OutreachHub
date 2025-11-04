import { Component, OnInit } from '@angular/core';
import { TemplatesService } from '../../../core/services/template.service'; // Corrected service import
import { Template } from '../../../core/interfaces/template.interface';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  // --- STATE --- //
  templates: Template[] = []; // This holds the master list of templates
  loading = true;
  errorMessage = '';

  // Modals and Form State
  showModal = false;
  editingTemplate: Template | null = null;
  templateForm: Partial<Template> = this.createEmptyTemplate();
  showConfirmModal = false;
  templateToDelete: Template | null = null;
  showInfoModal = false;
  infoTemplate: Template | null = null;

  // Role check
  isEditor = false;

  // --- PAGINATION STATE --- //
  paginatedTemplates: Template[] = []; // Holds the templates for the current page's view
  currentPage = 1;
  readonly pageSize = 9; // Display 9 templates per page (for a 3x3 grid)
  totalPages = 0;

  constructor(
    private templatesService: TemplatesService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isEditor = this.auth.getUserRole() === 'editor';
    this.loadTemplates();
  }

  // --- DATA LOADING --- //
  loadTemplates(): void {
    this.loading = true;
    this.templatesService.getTemplates().subscribe({
      next: (data: Template[]) => {
        this.templates = data;
        
        // --- FIXED: Initialize pagination after data is fetched ---
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.templates.length / this.pageSize);
        this.updatePagination(); 
        // ---------------------------------------------------------

        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching templates:', err);
        this.errorMessage = 'Failed to load templates';
        this.loading = false;
      }
    });
  }

  // --- PAGINATION LOGIC --- //
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.templates.length);
  }

  updatePagination(): void {
    this.paginatedTemplates = this.templates.slice(this.startIndex, this.endIndex);
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

  // --- CRUD & MODAL ACTIONS --- //

  openAddTemplate(): void {
    this.editingTemplate = null;
    this.templateForm = this.createEmptyTemplate();
    this.showModal = true;
  }

  editTemplate(template: Template): void {
    this.editingTemplate = template;
    this.templateForm = JSON.parse(JSON.stringify(template)); // Deep copy
    this.showModal = true;
  }

  viewTemplate(template: Template): void {
    this.infoTemplate = template;
    this.showInfoModal = true;
  }

  saveTemplate(): void {
    if (!this.templateForm.name || !this.templateForm.message?.text) {
      this.errorMessage = 'Template name and message are required.';
      return;
    }

    const payload = { ...this.templateForm };
    const action = this.editingTemplate
      ? this.templatesService.updateTemplate(this.editingTemplate._id!, payload)
      : this.templatesService.addTemplate(payload as Template);

    action.subscribe({
      next: () => {
        this.loadTemplates(); // Reload the list to show changes and reset pagination
        this.closeModal();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to save template', err);
        this.errorMessage = `Failed to save template: ${err.error?.message || err.message}`;
      }
    });
  }

  confirmDelete(template: Template): void {
    this.templateToDelete = template;
    this.showConfirmModal = true;
  }

  performDelete(): void {
    if (!this.templateToDelete?._id) return;

    this.templatesService.deleteTemplate(this.templateToDelete._id).subscribe({
      next: () => {
        this.loadTemplates(); // Reload the list
        this.cancelDelete();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to delete template', err);
        this.errorMessage = `Failed to delete template: ${err.error?.message || err.message}`;
        this.cancelDelete();
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTemplate = null;
    this.errorMessage = '';
  }

  cancelDelete(): void {
    this.showConfirmModal = false;
    this.templateToDelete = null;
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
    this.infoTemplate = null;
  }

  private createEmptyTemplate(): Partial<Template> {
    return {
      name: '',
      type: 'Text',
      message: { text: '', imageUrl: '' }
    };
  }
}

