import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
   role: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.role = this.authService.getUserRole();
    console.log('Current user role:', this.role);
  }

  canEdit(): boolean {
    return this.authService.hasRole('editor'); // only editors can edit
  }

}
