import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const redirectionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Verificamos si existe el token JWT en el servicio o en localStorage
  if (authService.jwt) {
    return true;
  } else {
    // Si no hay token, redirigimos a login con queryParam para ir a feed después
    router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }
};
