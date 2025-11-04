import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRole = route.data['role']; // from route config
    const userRole = this.authService.getUserRole();

    if (userRole === expectedRole) {
      return true;
    }

    // redirect if user does not have required role
    return this.router.createUrlTree(['/unauthorized']);
  }
}
