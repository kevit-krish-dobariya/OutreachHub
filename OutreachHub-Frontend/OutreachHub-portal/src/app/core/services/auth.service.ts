import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private activeWorkspaceSubject = new BehaviorSubject<string | null>(null);
  private isBrowser: boolean;
  private apiUrl = 'http://localhost:3000/auth'; // adjust to your backend

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const ws = localStorage.getItem('activeWorkspace');
      if (ws) {
        this.activeWorkspaceSubject.next(ws);
      }
    }
  }

  /** ===== API Calls ===== **/

  login(payload: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  signup(payload: { username: string; password: string; email?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, payload);
  }

  /** ===== Auth Data Handling ===== **/

  setAuthData(data: any) {
    if (!this.isBrowser) return;

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    if (data.workspaces) {
      localStorage.setItem('workspaces', JSON.stringify(data.workspaces));
    }
    if (data.user && typeof data.user === 'object' && data.user._id) {
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('AuthService: User data successfully saved to localStorage:', data.user);
    } else {
      console.error('AuthService: Invalid user data provided to setAuthData', data);
    }
  }

  getToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
  }

  /** ===== User Helpers ===== **/

  /** Get the logged-in user object */
  getUser(): any | null {
    if (!this.isBrowser) return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.warn('AuthService: localStorage user item is null.');
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      console.error('AuthService: Failed to parse user data from localStorage.');
      return null;
    }
  }

  /** Get logged-in user ID */
  getUserId(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error('AuthService: No user data found in localStorage.');
      return null;
    }
    try {
      const userObj = JSON.parse(userStr);
      const userId = userObj?._id || null;
      console.log('AuthService: getUserId() returning:', userId);
      return userId;
    } catch (err) {
      console.error('AuthService: Error parsing user from localStorage', err);
      return null;
    }
  }


  /** Get user role */
  getUserRole(): string | null {
    return this.isBrowser ? localStorage.getItem('role') : null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /** ===== Workspace Helpers ===== **/

  /** Get workspace ID */
  getWorkspaceId(): string | null {
    const activeWs = this.activeWorkspaceSubject.value;
    if (activeWs) return activeWs;

    if (this.isBrowser) {
      const ws = localStorage.getItem('workspaceId');
      if (ws) return ws;
    }

    return null;
  }

  setWorkspaceId(workspaceId: string) {
    if (this.isBrowser) {
      localStorage.setItem('workspaceId', workspaceId);
    }
  }

  setActiveWorkspace(workspaceId: string) {
    this.activeWorkspaceSubject.next(workspaceId);

    if (this.isBrowser) {
      localStorage.setItem('activeWorkspace', workspaceId);
    }
  }

  getActiveWorkspace(): string | null {
    return this.activeWorkspaceSubject.value;
  }

  activeWorkspace$ = this.activeWorkspaceSubject.asObservable();

  /** ===== Logout ===== **/

  logout() {
    if (this.isBrowser) {
      localStorage.clear();
    }
    this.activeWorkspaceSubject.next(null);
  }
}
