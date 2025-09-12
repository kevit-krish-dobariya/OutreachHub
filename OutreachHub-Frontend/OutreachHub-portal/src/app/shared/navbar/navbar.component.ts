import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

  ngOnInit() {
    // Fetch logged-in user
    const userStr = localStorage.getItem('user');
    this.username = userStr ? JSON.parse(userStr)?.username || 'User' : 'User';
  }
  dropdownOpen = false;
  mobileMenuOpen = false;

  // Temporary hardcoded values
  username = 'Krish Patel';

  constructor(private router: Router) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
