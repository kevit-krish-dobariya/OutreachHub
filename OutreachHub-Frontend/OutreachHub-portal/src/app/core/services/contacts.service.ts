import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // ✅ import AuthService

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private apiUrl =
    'http://localhost:3000/outreachhub/689c24b6b6bfe5c6ea40008f/contacts';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getContacts() {
    return this.http.get(this.apiUrl, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  addContact(contact: any) {
    return this.http.post(this.apiUrl, contact, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateContact(id: string, contact: any) {
    return this.http.put(`${this.apiUrl}/${id}`, contact, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  deleteContact(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  importCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
