import { Component, OnInit } from '@angular/core';
import { TemplatesService } from '../../../core/services/template.service';
import { Template } from '../../../core/interfaces/template.interface';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  templates: Template[] = [];
  showModal = false;
  editingTemplate: Template | null = null;
  templateForm: Partial<Template> = {
    name: '',
    type: 'Text',
    message: { text: '', imageUrl: '' }
  };
  loading = false;
  errorMessage = '';

  showConfirmModal = false;
  templateToDelete: Template | null = null;
  showInfoModal = false;
  infoTemplate: Template | null = null;

  constructor(
    private templatesService: TemplatesService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  // Fetch all templates for the active workspace
  loadTemplates() {
    this.loading = true;
    this.templatesService.getTemplates().subscribe({
      next: (data: any) => {
        this.templates = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching templates:', err);
        this.errorMessage = 'Failed to load templates';
        this.loading = false;
      }
    });
  }

  // Open modal for creating a new template
  openAddTemplate() {
    this.templateForm = {
      name: '',
      type: 'Text',
      message: { text: '', imageUrl: '' }
    };
    this.editingTemplate = null;
    this.showModal = true;
  }

  // Open modal to edit an existing template
  editTemplate(template: Template) {
    this.templateForm = { ...template, message: { ...template.message } };
    this.editingTemplate = template;
    this.showModal = true;
  }

  // Save a template (create or update)
  saveTemplate() {
    if (!this.templateForm.name || !this.templateForm.message?.text) {
      this.errorMessage = 'Template name and message are required.';
      return;
    }

    // Create a clean payload to send to the service
    const payload: Partial<Template> = {
      name: this.templateForm.name,
      type: this.templateForm.type,
      message: {
        text: this.templateForm.message.text,
        imageUrl: this.templateForm.type === 'Text-Image' ? this.templateForm.message.imageUrl : ''
      }
    };

    if (this.editingTemplate) {
      this.templatesService.updateTemplate(this.editingTemplate._id!, payload).subscribe({
        next: updated => {
          const idx = this.templates.findIndex(t => t._id === updated._id);
          if (idx !== -1) {
            this.templates[idx] = updated;
          }
          this.closeModal();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to update template', err);
          this.errorMessage = `Failed to update template: ${err.error.message || err.message}`;
        }
      });
    } else {
      this.templatesService.addTemplate(payload as Template).subscribe({
        next: newTemplate => {
          this.templates.push(newTemplate);
          this.closeModal();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to add template', err);
          this.errorMessage = `Failed to add template: ${err.error.message || err.message}`;
        }
      });
    }
  }

  // Confirm deletion with a modal
  confirmDelete(template: Template) {
    this.templateToDelete = template;
    this.showConfirmModal = true;
  }

  // Perform deletion after confirmation
  performDelete() {
    if (!this.templateToDelete || !this.templateToDelete._id) {
      this.cancelDelete();
      return;
    }
    this.templatesService.deleteTemplate(this.templateToDelete._id).subscribe({
      next: () => {
        this.templates = this.templates.filter(t => t._id !== this.templateToDelete!._id);
        this.cancelDelete();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to delete template', err);
        this.errorMessage = `Failed to delete template: ${err.error.message || err.message}`;
        this.cancelDelete();
      }
    });
  }

  // View template content
  viewTemplate(template: Template) {
    this.infoTemplate = template;
    this.showInfoModal = true;
  }

  // Close the add/edit modal
  closeModal() {
    this.showModal = false;
    this.editingTemplate = null;
    this.errorMessage = '';
  }

  // Cancel deletion
  cancelDelete() {
    this.showConfirmModal = false;
    this.templateToDelete = null;
  }

  // Close the info modal
  closeInfoModal() {
    this.showInfoModal = false;
    this.infoTemplate = null;
  }
}
