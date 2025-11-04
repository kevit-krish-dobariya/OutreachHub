import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Define Workspace interface
export interface Workspace {
  _id?: string;
  name: string;
  description: string;
  // This should match the shape of the populated 'createdBy' object from your backend
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'pending' | 'inactive'; // MODIFIED: Added the status property
}

@Injectable({
  providedIn: 'root'
})
export class WorkspacesService {
  private baseUrl = 'http://localhost:3000/workspaces';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.baseUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getWorkspaceById(id: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.baseUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  createWorkspace(workspace: Workspace): Observable<Workspace> {
    const payload = {
      name: workspace.name,
      description: workspace.description,
      createdBy: workspace.createdBy
    };

    return this.http.post<Workspace>(this.baseUrl, payload, {
      headers: this.auth.getAuthHeaders()
    });
  }

  updateWorkspace(id: string, workspace: Partial<Workspace>): Observable<Workspace> {
    const payload = {
      name: workspace.name,
      description: workspace.description
    };

    return this.http.put<Workspace>(`${this.baseUrl}/${id}`, payload, {
      headers: this.auth.getAuthHeaders()
    });
  }

  deleteWorkspace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
