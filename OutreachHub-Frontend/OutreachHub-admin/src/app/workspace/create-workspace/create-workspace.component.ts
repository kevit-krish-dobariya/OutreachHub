import { Component } from '@angular/core';
import { Workspace, WorkspacesService } from '../../core/service/workspace.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-workspace',
  templateUrl: './create-workspace.component.html',
  styleUrl: './create-workspace.component.scss'
})
export class CreateWorkspaceComponent {
 workspace: Partial<Workspace> = {
    name: '',
    description: '',
    createdBy: ''
  };
  isLoading = false;
  errorMsg = '';

  constructor(
    private workspaceService: WorkspacesService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMsg = '';
    // Ensure all required fields are present and types match Workspace
    const workspaceToCreate: Workspace = {
      name: this.workspace.name ?? '',
      description: this.workspace.description ?? '',
      createdBy: this.workspace.createdBy ?? ''
      // Add other required Workspace fields here if needed
    };
    this.workspaceService.createWorkspace(workspaceToCreate).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/workspace/add-workspace']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'Failed to create workspace.';
      }
    });
  }

  goToWorkspaceList(): void {
    this.router.navigate(['/workspace/add-workspace']);
  }
}
