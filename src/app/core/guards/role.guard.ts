import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '@models/user.model';
import { AuthService } from '@app-core';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['allowedRoles'] as UserRole[]) ?? [];
  const allowedSet = new Set(allowedRoles.map((r) => r.toLowerCase()));

  return auth.whenReady().then(() => {
    const currentRole = auth.userRole();
    const currentRoleLower = (currentRole ?? '').toLowerCase();

    if (!auth.isLoggedIn()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    if (!currentRoleLower || !allowedSet.has(currentRoleLower)) {
      const fallbackRoute =
        currentRoleLower === 'admin' ? '/admin' : '/tabs/wardrobe';
      router.navigateByUrl(fallbackRoute);
      return false;
    }

    return true;
  });
};
