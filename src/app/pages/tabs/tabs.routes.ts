import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'wardrobe',
        loadComponent: () => import('./wardrobe/wardrobe.page').then((m) => m.WardrobePage),
      },
      {
        path: 'outfits',
        loadComponent: () => import('./outfits/outfits.page').then((m) => m.OutfitsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'wardrobe',
        pathMatch: 'full',
      },
    ],
  },
];
