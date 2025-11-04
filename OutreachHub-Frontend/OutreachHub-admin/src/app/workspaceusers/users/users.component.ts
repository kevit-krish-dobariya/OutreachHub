import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { WorkspaceUsersService, WorkspaceMember, WorkspaceRole } from '../../core/service/workspaceuser.service';
import { WorkspacesService, Workspace } from '../../core/service/workspace.service';
import { AuthService, SignupResponse } from '../../core/service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {

  // --- COMPONENT STATE ---
  allWorkspaces: Workspace[] = [];
  workspaceMembers: WorkspaceMember[] = [];
  selectedWorkspaceId: string | null = null;
  workspaceName = '';
  isLoading = true;
  userNotFound = false; // Used to trigger the invite flow in the modal

  // --- MODAL & FORM STATE ---
  showAddUserModal = false;
  showRemoveUserModal = false;
  showConfirmAddModal = false;
  addUserForm!: FormGroup;
  userToRemove: WorkspaceMember | null = null;
  newUserPayload: { email: string; role: WorkspaceRole } | null = null;

  constructor(
    private fb: FormBuilder,
    private workspacesService: WorkspacesService,
    private workspaceUsersService: WorkspaceUsersService,
    private authService: AuthService // Added missing dependency
  ) {}

  // --- LIFECYCLE HOOKS ---

  ngOnInit(): void {
    this.loadWorkspaces();
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer' as WorkspaceRole, Validators.required],
    });
  }

  // --- DATA LOADING ---

  /**
   * Fetches the initial list of all workspaces to populate the dropdown selector.
   */
  loadWorkspaces(): void {
    this.isLoading = true;
    this.workspacesService.getWorkspaces().subscribe({
      next: (workspaces) => {
        this.allWorkspaces = workspaces;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load workspaces:', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * Fetches the list of users for a specific workspace.
   * @param workspaceId The ID of the selected workspace.
   */
  loadWorkspaceUsers(workspaceId: string): void {
    this.workspaceUsersService.getUsersForWorkspace(workspaceId).subscribe(members => {
      this.workspaceMembers = members;
    });
  }

  // --- UI EVENT HANDLERS ---

  /**
   * Triggered when the user selects a new workspace from the dropdown.
   * @param event The change event from the select element.
   */
  onWorkspaceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const workspaceId = target.value;

    if (workspaceId && workspaceId !== 'null') {
      this.selectedWorkspaceId = workspaceId;
      const selectedWs = this.allWorkspaces.find(ws => ws._id === workspaceId);
      this.workspaceName = selectedWs?.name ?? '';
      this.loadWorkspaceUsers(workspaceId);
    } else {
      // Reset the view if the placeholder is selected
      this.selectedWorkspaceId = null;
      this.workspaceName = '';
      this.workspaceMembers = [];
    }
  }

  // --- MODAL MANAGEMENT ---

  /** Opens the modal for adding a user to the current workspace. */
  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.userNotFound = false;
    this.addUserForm.reset({ role: 'viewer' });
  }

  /** Opens the confirmation modal for removing a user. */
  openRemoveUserModal(member: WorkspaceMember): void {
    this.userToRemove = member;
    this.showRemoveUserModal = true;
  }

  /** Closes all active modals and resets their state. */
  closeModals(): void {
    this.showAddUserModal = false;
    this.showRemoveUserModal = false;
    this.showConfirmAddModal = false;
    this.userToRemove = null;
    this.newUserPayload = null;
  }

  // --- CORE ACTIONS ---

  /**
   * Handles the initial submission of the "Add User" form. It triggers a confirmation modal.
   */
  onAddUserSubmit(): void {
    if (this.addUserForm.invalid || !this.selectedWorkspaceId) return;
    
    this.newUserPayload = this.addUserForm.value;
    this.showAddUserModal = false;
    this.showConfirmAddModal = true;
  }

  /**
   * Handles the final confirmation to create a new user and assign them to the workspace.
   */
  onConfirmAddUser(): void {
    if (!this.newUserPayload || !this.selectedWorkspaceId) return;

    const { email, role } = this.newUserPayload;
    const username = email.split('@')[0];
    const password = `${username}@123`;
    
    const signupPayload = { 
      username, 
      email, 
      password,
      role,
      phoneNumber: '0000000000' // Placeholder phone number
    };

    // Chain API calls: first sign up the user, then assign them to the workspace.
    this.authService.signup(signupPayload).pipe(
      switchMap((signupResponse: SignupResponse) => {
        const newUserId = signupResponse.user._id;
        return this.workspaceUsersService.assignUserToWorkspace(this.selectedWorkspaceId!, newUserId, role);
      })
    ).subscribe({
      next: (newMember: WorkspaceMember) => {
        this.workspaceMembers.push(newMember);
        this.closeModals();
      },
      error: (err: any) => {
        console.error('Failed to create and assign user:', err);
        this.closeModals();
      }
    });
  }

  /**
   * Updates a user's role within the current workspace.
   * @param event The change event from the role select element.
   * @param member The workspace member whose role is being changed.
   */
  onRoleChange(event: Event, member: WorkspaceMember): void {
    const newRole = (event.target as HTMLSelectElement).value as WorkspaceRole;
    this.workspaceUsersService.updateUserRole(member._id, newRole).subscribe({
      next: (updatedMember) => {
        member.role = updatedMember.role;
      },
      error: (err) => {
        console.error('Failed to update role:', err);
        // Revert the UI on failure
        (event.target as HTMLSelectElement).value = member.role;
      },
    });
  }

  /**
   * Confirms and executes the removal of a user from the workspace.
   */
  onConfirmRemove(): void {
    if (!this.userToRemove) return;
    
    this.workspaceUsersService.removeUserFromWorkspace(this.userToRemove._id).subscribe({
      next: () => {
        this.workspaceMembers = this.workspaceMembers.filter(m => m._id !== this.userToRemove!._id);
        this.closeModals();
      },
      error: (err) => {
        console.error('Failed to remove user:', err);
        this.closeModals();
      },
    });
  }
}

