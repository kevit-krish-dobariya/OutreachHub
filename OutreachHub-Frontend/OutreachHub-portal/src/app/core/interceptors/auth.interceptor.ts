import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // no token for login/signup
    if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token'); // or use authService.getToken() if injectable
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
