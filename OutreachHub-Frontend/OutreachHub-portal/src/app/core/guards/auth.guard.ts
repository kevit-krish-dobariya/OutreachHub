import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  console.log('AuthGuard token:', token);

  if (token) {
    return true;
  } else {
    console.warn('Blocked by AuthGuard: no token');
    router.navigate(['/auth/login']);
    return false;
  }
};
