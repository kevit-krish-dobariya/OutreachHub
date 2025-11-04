import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // 1. Get the authentication token from localStorage (or a service)
    const token = localStorage.getItem('access_token');

    // 2. If the token exists, clone the request and add the Authorization header
    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      // 3. Pass the cloned request to the next handler
      return next.handle(clonedReq);
    }

    // If no token, pass the original request without modification
    return next.handle(req);
  }
}
