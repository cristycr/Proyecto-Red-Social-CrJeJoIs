import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const redirectionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Verificamos si existe el token JWT en localStorage
  const token = localStorage.getItem('jwt');

  if (token) {
    // Si hay token, permitimos acceso
    return true;
  } else {
    // Si no hay token, redirigimos a login con queryParam para ir a feed después
    router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }
};