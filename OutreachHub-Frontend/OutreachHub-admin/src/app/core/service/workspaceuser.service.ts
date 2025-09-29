import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- INTERFACES ---
export interface User {
  _id: string;
  username: string;
  email: string;
}

export enum WorkspaceRole {
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface WorkspaceMember {
  _id: string; // This is the ID of the WorkspaceUser document
  user: User;
  role: 'editor' | 'viewer';
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceUsersService {

  // Define base URLs for different parts of the API
  private workspaceUsersApiUrl = 'http://localhost:3000/workspace-users';
  private authApiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) { }

  /**
   * NEW: Fetches all users who are not assigned to any workspace.
   * This calls the /auth/unassigned endpoint as requested.
   */
  getUnassignedUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.authApiUrl}/unassigned`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches all users associated with a specific workspace.
   */
  getUsersForWorkspace(workspaceId: string): Observable<WorkspaceMember[]> {
    return this.http.get<WorkspaceMember[]>(`${this.workspaceUsersApiUrl}/workspace/${workspaceId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Adds a user to a workspace by their email address.
   */
  addUserToWorkspace(workspaceId: string, email: string, role: 'editor' | 'viewer'): Observable<WorkspaceMember> {
    const payload = { email, role };
    return this.http.post<WorkspaceMember>(`${this.workspaceUsersApiUrl}/${workspaceId}`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Assigns an existing unassigned user to a workspace.
   * @param workspaceId The ID of the workspace to assign the user to.
   * @param userId The ID of the user being assigned.
   * @param role The role to assign to the user within the workspace.
   */
  assignUserToWorkspace(workspaceId: string, userId: string, role: 'editor' | 'viewer'): Observable<WorkspaceMember> {
    const payload = { role };
    return this.http.post<WorkspaceMember>(`${this.workspaceUsersApiUrl}/${workspaceId}/assign/${userId}`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates the role of a user within a workspace.
   */
  updateUserRole(workspaceUserId: string, newRole: 'editor' | 'viewer'): Observable<WorkspaceMember> {
    const payload = { role: newRole };
    return this.http.put<WorkspaceMember>(`${this.workspaceUsersApiUrl}/${workspaceUserId}`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Removes a user from a workspace.
   */
  removeUserFromWorkspace(workspaceUserId: string): Observable<void> {
    return this.http.delete<void>(`${this.workspaceUsersApiUrl}/${workspaceUserId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * A centralized error handler for HTTP requests.
   */
  private handleError(error: HttpErrorResponse) {
    // Return the entire error so the component can inspect the status code
    return throwError(() => error);
  }
}

