import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const jwt = authService.jwt;

  if (!jwt) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${jwt}`
    }
  });

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.jwt = null;
        localStorage.removeItem('jwt');
        void router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};