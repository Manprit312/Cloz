import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '@models/user.model';
import { AuthService } from '@app-core';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['allowedRoles'] as UserRole[]) ?? [];
  const currentRole = auth.userRole();

  if (!auth.isLoggedIn()) {
    //if user is not logged in we then redirect them to login page
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    // User is logged in but not allowed — redirect based on their role
    const fallbackRoute = currentRole === 'admin' ? '/admin' : '/tabs/wardrobe';
    router.navigateByUrl(fallbackRoute);
    return false;
  }

  // Access granted
  return true;
};
