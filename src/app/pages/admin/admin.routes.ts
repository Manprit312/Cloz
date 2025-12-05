import { Routes } from '@angular/router';
import { AdminPage } from './admin.page';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/users.page').then((m) => m.UsersPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
