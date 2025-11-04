import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Define clear interfaces for the data structures
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface LoginResponse {
  access_token: string;
  user?: User; // MODIFIED: Made the user property optional to match backend response
  role: string;
}

export interface SignupResponse {
  message: string;
  user: User;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Logs in a user and handles session storage and navigation.
   */
  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // This block executes on successful login.
        // MODIFIED: The check no longer requires response.user to proceed.
        if (this.isBrowser() && response.access_token) {
          // 1. Always store the token if it exists. This is critical.
          this.setToken(response.access_token);
          
          // 2. Conditionally store the user object if the backend provides it.
          if (response.user) {
            this.setUser(response.user);
          }
          
          // 3. Handle navigation based on the role.
          if (response.role === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/dashboard']); // Default redirect
          }
        }
      })
    );
  }

  signup(payload: { username: string; email: string, password: string }): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, payload);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('access_token', token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  setUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (this.isBrowser()) {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }
}

