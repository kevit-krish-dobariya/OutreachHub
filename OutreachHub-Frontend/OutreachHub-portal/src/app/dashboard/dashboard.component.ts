import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
   role: string | null = null;
     isDarkMode = false;
     private themeSubscription!: Subscription;

  constructor(private authService: AuthService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
     // Subscribe to theme changes to update the icon
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = (theme === 'dark');
      });
    this.role = this.authService.getUserRole();
    console.log('Current user role:', this.role);
  }

  canEdit(): boolean {
    return this.authService.hasRole('editor'); // only editors can edit
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Toggles the application's theme between light and dark mode.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

}
