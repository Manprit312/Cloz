import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app-core';

export const redirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // if (!auth.isLoggedIn()) {
  //   return true;
  // }

  // const role = auth.userRole();

  // if (role === 'admin') {
  //   router.navigateByUrl('/admin');
  // } else {
  //   router.navigateByUrl('/tabs/home');
  // }

  return true;
};
