import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// --- INTERFACES ---
export interface DashboardStats {
  totalCampaigns: number;
  totalAudience: number;
  totalMessages: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    label: string;
    backgroundColor?: string | string[];
    borderColor?: string;
    tension?: number;
    fill?: boolean;
  }[];
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/dashboard';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Fetches the main statistics for the summary cards.
   * @param workspaceId The ID of the currently active workspace.
   */
  getStats(workspaceId: string): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/${workspaceId}`,
        { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Fetches data for the "Campaigns Per Day" chart.
   * @param workspaceId The ID of the workspace.
   * @param startDate The start of the date range.
   * @param endDate The end of the date range.
   */
  getCampaignsPerDay(workspaceId: string, startDate: string, endDate: string): Observable<ChartData> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<ChartData>(`${this.apiUrl}/campaigns-per-day/${workspaceId}`, { params, headers: this.auth.getAuthHeaders() } 
        
    );
  }

  /**
   * Fetches data for the "Messages Sent Per Day" chart.
   * @param workspaceId The ID of the workspace.
   * @param startDate The start of the date range.
   * @param endDate The end of the date range.
   */
  getMessagesPerDay(workspaceId: string, startDate: string, endDate: string): Observable<ChartData> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<ChartData>(`${this.apiUrl}/messages-per-day/${workspaceId}`, { params, headers: this.auth.getAuthHeaders() });
  }

  /**
   * Fetches data for the "Contacts Reached" chart.
   * @param workspaceId The ID of the workspace.
   * @param startDate The start of the date range.
   * @param endDate The end of the date range.
   */
  getContactsReached(workspaceId: string, startDate: string, endDate: string): Observable<ChartData> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<ChartData>(`${this.apiUrl}/contacts-reached/${workspaceId}`, { params, headers: this.auth.getAuthHeaders() });
  }
}
