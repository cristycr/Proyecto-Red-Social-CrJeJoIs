import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const redirectionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Obtenemos el token JWT de authService
  const token = authService.getToken();

  if (token) {
    // Si hay token, permitimos acceso
    return true;
  } else {
    // Si no hay token, redirigimos a login con queryParam para ir a feed después
    router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }
};