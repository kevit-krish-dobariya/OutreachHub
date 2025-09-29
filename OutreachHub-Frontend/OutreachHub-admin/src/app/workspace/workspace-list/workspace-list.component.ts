import { Component, OnInit } from '@angular/core';
import { Workspace, WorkspacesService } from '../../core/service/workspace.service';
import { WorkspaceUsersService, WorkspaceMember } from '../../core/service/workspaceuser.service';
import { AuthService } from '../../core/service/auth.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

/**
 * This interface represents the combined data structure needed for the view,
 * merging data from Workspaces, WorkspaceUsers, and the logged-in admin.
 */
export interface WorkspaceViewModel extends Workspace {
  owner: string;
  users: WorkspaceMember[];
  status: 'active' | 'pending' | 'inactive'; // Added status property
}

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
})
export class WorkspaceListComponent implements OnInit {

  // --- COMPONENT STATE ---

  /** The complete list of workspaces, enriched with owner and user data. */
  workspaces: WorkspaceViewModel[] = [];

  /** The currently selected workspace to be displayed in the modal. */
  selectedWorkspace: WorkspaceViewModel | null = null;

  /** Loading indicator state. */
  isLoading = true;

  constructor(
    private workspaceService: WorkspacesService,
    private workspaceUsersService: WorkspaceUsersService,
    private authService: AuthService
  ) {}

  // --- LIFECYCLE HOOKS ---

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  // --- DATA FETCHING ---

  /**
   * Fetches the list of workspaces and enriches each one with the owner's
   * name and a list of its associated users.
   */
  loadWorkspaces(): void {
    this.isLoading = true;
    const adminUsername = this.authService.getUser()?.username || 'Admin';

    this.workspaceService.getWorkspaces().pipe(
      switchMap(workspaces => {
        if (!workspaces || workspaces.length === 0) {
          return of([]); // Return an observable of an empty array if no workspaces
        }

        // Create an array of observables, each fetching users for a single workspace
        const enrichedWorkspaceObservables = workspaces.map(ws =>
          this.workspaceUsersService.getUsersForWorkspace(ws._id!).pipe(
            map(users => ({
              ...ws,
              users: users || [], // Default to an empty array
              owner: adminUsername, // Set the owner from the logged-in admin
              status: ws.status || 'inactive' // Ensure status has a default value
            }))
          )
        );

        // Execute all user fetch calls in parallel for efficiency
        return forkJoin(enrichedWorkspaceObservables);
      })
    ).subscribe({
      next: (populatedWorkspaces) => {
        this.workspaces = populatedWorkspaces as WorkspaceViewModel[];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching and populating workspaces:', err);
        this.isLoading = false;
      }
    });
  }

  // --- MODAL MANAGEMENT ---

  /**
   * Sets the selected workspace, which triggers the details modal to open.
   * @param workspace The workspace object to display.
   */
  openWorkspace(workspace: WorkspaceViewModel): void {
    this.selectedWorkspace = workspace;
  }

  /**
   * Clears the selected workspace, which closes the details modal.
   */
  closeModal(): void {
    this.selectedWorkspace = null;
  }
}
