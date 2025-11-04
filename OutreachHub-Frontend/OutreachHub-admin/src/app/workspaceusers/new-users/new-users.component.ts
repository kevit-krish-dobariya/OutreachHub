import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { WorkspaceUsersService, User } from '../../core/service/workspaceuser.service';
import { WorkspacesService, Workspace } from '../../core/service/workspace.service';

/**
 * Extends the base User interface to include a temporary property for the UI,
 * allowing us to track which workspace has been selected for each user.
 */
interface UnassignedUser extends User {
  selectedWorkspaceId?: string;
}

@Component({
  selector: 'app-new-users', // Renamed selector for clarity
  templateUrl: './new-users.component.html',
  styleUrls: ['./new-users.component.scss']
})
export class NewUsersComponent implements OnInit {

  // --- COMPONENT STATE ---
  unassignedUsers: UnassignedUser[] = [];
  allWorkspaces: Workspace[] = [];
  isLoading = true;

  constructor(
    private workspaceUsersService: WorkspaceUsersService,
    private workspacesService: WorkspacesService
  ) {}

  // --- LIFECYCLE HOOKS ---

  ngOnInit(): void {
    this.loadInitialData();
  }

  // --- DATA FETCHING ---

  /**
   * Fetches the list of unassigned users and the list of all available workspaces
   * concurrently for better performance.
   */
  loadInitialData(): void {
    this.isLoading = true;

    // Use forkJoin to run both API calls in parallel.
    forkJoin({
      users: this.workspaceUsersService.getUnassignedUsers(),
      workspaces: this.workspacesService.getWorkspaces()
    }).subscribe({
      next: ({ users, workspaces }) => {
        this.unassignedUsers = users;
        this.allWorkspaces = workspaces;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load initial data:', err);
        this.isLoading = false;
        // Optionally, display an error message in the UI here.
      }
    });
  }

  // --- UI ACTIONS ---

  /**
   * Handles the "Assign" button click. Assigns a user to their selected workspace.
   * @param user The user object, which includes the `selectedWorkspaceId` from the dropdown.
   */
  onAssignUser(user: UnassignedUser): void {
    if (!user.selectedWorkspaceId) {
      console.error('No workspace has been selected for this user.');
      return;
    }

    const defaultRole = 'viewer'; // Assign 'viewer' as the default role for new members

    this.workspaceUsersService.assignUserToWorkspace(user.selectedWorkspaceId, user._id, defaultRole).subscribe({
      next: () => {
        // For immediate UI feedback, remove the user from the local list upon successful assignment.
        this.unassignedUsers = this.unassignedUsers.filter(u => u._id !== user._id);

        // Optionally, show a success notification (e.g., using a toast service).
        console.log(`Successfully assigned ${user.username} to a workspace.`);
      },
      error: (err) => {
        console.error(`Failed to assign user ${user.username}:`, err);
        // Optionally, show an error message to the admin.
      }
    });
  }
}
