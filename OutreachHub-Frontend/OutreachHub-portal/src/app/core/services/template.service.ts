import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '../interfaces/template.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private baseUrl = 'http://localhost:3000/outreachhub';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getApiUrl(path: string = ''): string {
    const workspaceId = this.auth.getActiveWorkspace() || this.auth.getWorkspaceId();
    if (!workspaceId) throw new Error('No active workspace selected');
    return `${this.baseUrl}/${workspaceId}/templates${path}`;
  }

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.getApiUrl(), {
      headers: this.auth.getAuthHeaders()
    });
  }

  addTemplate(template: Template): Observable<Template> {
    const payload = {
      name: template.name,
      type: template.type,
      messageText: template.message?.text,
      imageUrl: template.message?.imageUrl,
      workspaceId: template.workspaceId,
      createdBy: template.createdBy
    };

    return this.http.post<Template>(this.getApiUrl(), payload, {
      headers: this.auth.getAuthHeaders()
    });
  }

  updateTemplate(id: string, template: Partial<Template>): Observable<Template> {
    const payload = {
      name: template.name,
      type: template.type,
      messageText: template.message?.text,
      imageUrl: template.message?.imageUrl,
    };
    return this.http.patch<Template>(this.getApiUrl(`/${id}`), payload, {
      headers: this.auth.getAuthHeaders()
    });
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`/${id}`), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
