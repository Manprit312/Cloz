import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { redirectGuard } from '@app-core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [redirectGuard],
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((m) => m.tabsRoutes),
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin', 'user'] },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin'] },
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage
      ),
  },
];
