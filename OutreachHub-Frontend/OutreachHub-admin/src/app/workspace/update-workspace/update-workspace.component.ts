import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workspace, WorkspacesService } from '../../core/service/workspace.service';

@Component({
  selector: 'app-update-workspace',
  templateUrl: './update-workspace.component.html',
})
export class UpdateWorkspaceComponent implements OnInit {
  workspaceForm!: FormGroup;
  workspaceId!: string;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspacesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workspaceId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.workspaceId) {
      this.errorMsg = 'Invalid workspace ID.';
      return;
    }

    // Build empty form initially
    this.workspaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
    });

    // Fetch workspace data and patch into form
    this.isLoading = true;
    this.workspaceService.getWorkspaceById(this.workspaceId).subscribe({
      next: (ws: Workspace) => {
        this.workspaceForm.patchValue({
          name: ws.name,
          description: ws.description,
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load workspace.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.workspaceForm.invalid) return;

    this.isLoading = true;
    const updatePayload = this.workspaceForm.value;

    this.workspaceService.updateWorkspace(this.workspaceId, updatePayload).subscribe({
      next: () => {
        this.successMsg = 'Workspace updated successfully!';
        this.isLoading = false;
        // navigate back after short delay
        setTimeout(() => this.router.navigate(['/workspace/add-workspace']), 1500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to update workspace.';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/workspace/add-workspace']);
  }

  // Helper getter for form controls
  get f() {
    return this.workspaceForm.controls;
  }
}
