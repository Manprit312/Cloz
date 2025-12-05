import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { redirectGuard } from '@app-core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [redirectGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'verification',
    loadComponent: () =>
      import('./pages/verification/verification.page').then(
        (m) => m.VerificationPage
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verification/verification.page').then(
        (m) => m.VerificationPage
      ),
  },
  {
    path: 'change-email',
    loadComponent: () =>
      import('./pages/change-email/change-email.page').then(
        (m) => m.ChangeEmailPage
      ),
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin', 'user'] },
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
];
