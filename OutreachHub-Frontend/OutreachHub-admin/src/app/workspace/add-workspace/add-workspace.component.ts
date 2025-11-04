import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Workspace, WorkspacesService } from '../../core/service/workspace.service';

@Component({
  selector: 'app-add-workspace', // Renamed selector for clarity
  templateUrl: './add-workspace.component.html',
})
export class AddWorkspaceComponent implements OnInit {

  // --- COMPONENT STATE ---
  workspaces: Workspace[] = [];
  isLoading = true;

  // --- MODAL STATE ---
  showDeleteModal = false;
  workspaceToDelete: Workspace | null = null;

  constructor(
    private workspaceService: WorkspacesService,
    private router: Router
  ) {}

  // --- LIFECYCLE HOOKS ---

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  // --- DATA FETCHING ---

  /**
   * Fetches the list of all workspaces from the server.
   */
  loadWorkspaces(): void {
    this.isLoading = true;
    this.workspaceService.getWorkspaces().subscribe({
      next: (data) => {
        this.workspaces = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load workspaces:', err);
        this.isLoading = false;
        // Optionally, display an error message in the UI
      },
    });
  }

  // --- NAVIGATION & UI ACTIONS ---

  /**
   * Navigates to the page for creating a new workspace.
   */
  navigateToCreate(): void {
    this.router.navigate(['/workspace/create']);
  }

  /**
   * Navigates to the edit page for the selected workspace.
   * @param workspace The workspace to be edited.
   */
  onEdit(workspace: Workspace): void {
    if (workspace._id) {
      this.router.navigate(['/workspace/edit', workspace._id]);
    } else {
      console.error('Workspace ID is missing, cannot edit.');
    }
  }

  /**
   * Opens the delete confirmation modal for the selected workspace.
   * @param workspace The workspace to be deleted.
   */
  onDelete(workspace: Workspace): void {
    this.workspaceToDelete = workspace;
    this.showDeleteModal = true;
  }

  /**
   * Closes the delete modal and resets the state.
   */
  onCancelDelete(): void {
    this.showDeleteModal = false;
    this.workspaceToDelete = null;
  }

  /**
   * Confirms and executes the deletion of the selected workspace.
   */
  onConfirmDelete(): void {
    if (!this.workspaceToDelete?._id) return;

    this.workspaceService.deleteWorkspace(this.workspaceToDelete._id).subscribe({
      next: () => {
        // For instant UI feedback, remove the workspace from the local array.
        this.workspaces = this.workspaces.filter(w => w._id !== this.workspaceToDelete?._id);
        this.onCancelDelete(); // Close the modal and reset state
        // Optionally, show a success notification (e.g., toast message)
      },
      error: (err) => {
        console.error('Failed to delete workspace:', err);
        this.onCancelDelete(); // Still hide the modal on failure
        // Optionally, show an error message to the user
      },
    });
  }
}
