import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// --- INTERFACES ---
export interface AdminStats {
  totalWorkspaces: number;
  totalUsers: number;
  totalCampaigns: number;
  totalMessages: number;
}

// ADDED: Interface for a single activity log
export interface Activity {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  action: string;
  status: string;
  createdAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: { data: number[]; label: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:3000/admin-dashboard'; // Your NestJS backend URL

  constructor(private http: HttpClient, private auth: AuthService) { }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`,
    { headers: this.auth.getAuthHeaders() }
    );
  }

  getUserGrowth(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/user-growth`,
    { headers: this.auth.getAuthHeaders() }
    );
  }

  getCampaignPerformance(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/campaign-performance`,
    { headers: this.auth.getAuthHeaders() }
    );
  }

   getRecentActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/recent-activities`,
    { headers: this.auth.getAuthHeaders() }
    );
  }
}