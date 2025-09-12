import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Contact } from '../interfaces/contact.interface';

@Injectable({
  providedIn: 'root'
})
export class CampaignsService {
  private baseUrl = 'http://localhost:3000/outreachhub';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getApiUrl(path: string = ''): string {
    const wsId = this.auth.getActiveWorkspace() || this.auth.getWorkspaceId();
    if (!wsId) throw new Error('No active workspace selected');
    return `${this.baseUrl}/${wsId}/campaigns${path}`;
  }

  getCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(this.getApiUrl(''), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getTargetContacts(workspaceId: string, tags: string[]): Observable<Contact[]> {
  const params = tags.map(t => `tags=${t}`).join('&');
  return this.http.get<Contact[]>(
    `${this.baseUrl}/${workspaceId}/contacts/target-contacts?${params}`,
    { headers: this.auth.getAuthHeaders() }
  );
}

  getCampaignById(campaignId: string): Observable<any> {
    return this.http.get<any>(this.getApiUrl(`/${campaignId}`), {
      headers: this.auth.getAuthHeaders()
    });
  }

  addCampaign(campaign: any): Observable<any> {
    return this.http.post<any>(this.getApiUrl(''), campaign, {
      headers: this.auth.getAuthHeaders()
    });
  }

  updateCampaign(campaignId: string, campaign: any): Observable<any> {
    return this.http.put<any>(this.getApiUrl(`/${campaignId}`), campaign, {
      headers: this.auth.getAuthHeaders()
    });
  }

  deleteCampaign(campaignId: string): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`/${campaignId}`), {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ✅ Send campaign messages
  sendCampaignMessage(
  workspaceId: string,
  campaignId: string,
  payload: { contactIds: string[]; messageContent: string }
): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/${workspaceId}/campaign/${campaignId}/messages`,
    payload,
    { headers: this.auth.getAuthHeaders() }
  );
}


}
