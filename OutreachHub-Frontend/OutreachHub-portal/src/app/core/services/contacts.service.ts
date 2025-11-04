import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../interfaces/contact.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private baseUrl = 'http://localhost:3000/outreachhub';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getApiUrl(path: string = ''): string {
    const wsId = this.auth.getActiveWorkspace() || this.auth.getWorkspaceId();
    if (!wsId) throw new Error('No active workspace selected');
    return `${this.baseUrl}/${wsId}/contacts${path}`;
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.getApiUrl(), {
      headers: this.auth.getAuthHeaders()
    });
  }

addContact(contact: Contact): Observable<Contact> {
  const payload = {
    ...contact,
    workspaceId: contact.workspaceId,
    createdBy: contact.createdBy
  };
  return this.http.post<Contact>(this.getApiUrl(), payload, {
    headers: this.auth.getAuthHeaders()
  });
}
  updateContact(id: string, contact: Contact): Observable<Contact> {
    return this.http.patch<Contact>(this.getApiUrl(`/${id}`), contact, {
      headers: this.auth.getAuthHeaders()
    });
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`/${id}`), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
