import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';
  private tokenKey = 'access_token';
  private userKey = 'auth_user';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ===================== API CALLS =====================
  signup(userData: any): Observable<any> {
    const payload = { ...userData, role: 'viewer' };
    return this.http.post(`${this.baseUrl}/signup`, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // ===================== STORAGE HELPERS =====================
  private setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private getItem(key: string): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(key) : null;
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  // ===================== AUTH DATA =====================
  setAuthData(response: any): void {
    if (response?.access_token) {
      this.setItem(this.tokenKey, response.access_token);
    }
    if (response?.user) {
      this.setItem(this.userKey, JSON.stringify(response.user));
    }
  }

  getToken(): string | null {
    return this.getItem(this.tokenKey);
  }

  getCurrentUser(): any | null {
    const userStr = this.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    if (user?.role) return user.role;

    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  // ===================== AUTH HELPERS =====================
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(requiredRole: string): boolean {
    return this.getUserRole() === requiredRole;
  }

  logout(): void {
    this.removeItem(this.tokenKey);
    this.removeItem(this.userKey);
  }

  // ===================== HEADERS FOR API =====================
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }
}
