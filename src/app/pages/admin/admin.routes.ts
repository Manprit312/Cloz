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
        path: 'users/:userId',
        loadComponent: () =>
          import('./user-detail/user-detail.page').then((m) => m.UserDetailPage),
      },
      {
        path: 'wardrobe/:userId',
        loadComponent: () =>
          import('./wardrobe/admin-wardrobe-layout.page').then((m) => m.AdminWardrobeLayoutPage),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('app/pages/tabs/wardrobe/wardrobe.page').then((m) => m.WardrobePage),
          },
          {
            path: 'outfits',
            loadComponent: () =>
              import('app/pages/tabs/outfits/outfits.page').then((m) => m.OutfitsPage),
          },
          {
            path: 'category/:type',
            loadComponent: () =>
              import('./wardrobe/category/admin-wardrobe-category.page').then((m) => m.AdminWardrobeCategoryPage),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
