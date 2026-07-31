import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authHeader = authService.getAuthorizationHeader();
  let authReq = req;

  if (req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh')) {
    return next(req);
  }

  if (authHeader) {
    authReq = req.clone({ headers: req.headers.set('Authorization', authHeader) });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        return authService.refreshToken().pipe(
          switchMap((res: { token: string }) => {
            const newAuthHeader = `Bearer ${res.token}`;
            const newReq = req.clone({ headers: req.headers.set('Authorization', newAuthHeader) });
            return next(newReq);
          }),
          catchError((refreshErr) => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('profileName');
            localStorage.removeItem('role');
            // En vez de depender del router que podría fallar por el @if, forzamos la recarga al login
            window.location.href = '/login';
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
