
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  collapsed = false;

  navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Workspaces', path: '/workspaces', icon: '🏢' },
    { label: 'Contacts', path: '/contacts', icon: '👥' },
    { label: 'Campaigns', path: '/campaigns', icon: '📨' },
    { label: 'Templates', path: '/templates', icon: '📝' },
    { label: 'Analytics', path: '/analytics', icon: '📈' }
  ];

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
