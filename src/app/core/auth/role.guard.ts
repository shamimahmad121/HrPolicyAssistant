import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AppRole } from '../models/user.model';

/**
 * Route-level RBAC. This is a UX convenience only — every request still
 * needs the same role check enforced server-side, since a client-side
 * guard can always be bypassed.
 */
export function roleGuard(allowedRoles: AppRole[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const hasRole = auth.roles().some((role) => allowedRoles.includes(role));
    return hasRole ? true : router.createUrlTree(['/ask']);
  };
}
