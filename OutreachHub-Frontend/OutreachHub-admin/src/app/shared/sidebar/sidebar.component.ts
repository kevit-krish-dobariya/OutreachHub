import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { ThemeService } from '../../core/service/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit, OnDestroy {

  // --- COMPONENT STATE ---
  collapsed = false;
  isDarkMode = false;
  workspacesExpanded = false;
  manageUsersExpanded = false;

  // --- CONFIGURATION ---
  navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' }
  ];

  // --- OUTPUTS ---
  @Output() collapsedStateChanged = new EventEmitter<boolean>();

  // --- PRIVATE PROPERTIES ---
  private themeSubscription!: Subscription;

  // --- LIFECYCLE HOOKS ---

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes to update the icon and state
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = (theme === 'dark');
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks when the component is destroyed
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  // --- PUBLIC METHODS (Template Event Handlers) ---

  /**
   * Toggles the collapsed state of the entire sidebar.
   */
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedStateChanged.emit(this.collapsed);

    // Automatically close any open submenus when the sidebar collapses
    if (this.collapsed) {
      this.closeAllSubmenus();
    }
  }

  /**
   * Toggles the visibility of the "Workspaces" submenu.
   */
  toggleWorkspaces(): void {
    if (!this.collapsed) {
      this.workspacesExpanded = !this.workspacesExpanded;
    }
  }

  /**
   * Toggles the visibility of the "Manage Users" submenu.
   */
  toggleManageUsers(): void {
    if (!this.collapsed) {
      this.manageUsersExpanded = !this.manageUsersExpanded;
    }
  }

  /**
   * Toggles the application's theme between light and dark mode via the ThemeService.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Handles the user logout process via the AuthService.
   */
  handleLogout(): void {
    this.authService.logout();
  }

  // --- PRIVATE METHODS ---

  /**
   * A helper function to close all expandable submenus.
   */
  private closeAllSubmenus(): void {
    this.workspacesExpanded = false;
    this.manageUsersExpanded = false;
  }
}