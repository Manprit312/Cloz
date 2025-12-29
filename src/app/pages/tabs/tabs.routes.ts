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
        path: 'wardrobe/upper-garments',
        loadComponent: () => import('./wardrobe/upper-garments/upper-garments.page').then((m) => m.UpperGarmentsPage),
      },
      {
        path: 'wardrobe/add-upper-garment',
        loadComponent: () => import('./wardrobe/add-upper-garment/add-upper-garment.page').then((m) => m.AddUpperGarmentPage),
      },
      {
        path: 'wardrobe/bottoms',
        loadComponent: () => import('./wardrobe/bottoms/bottoms.page').then((m) => m.BottomsPage),
      },
      {
        path: 'wardrobe/add-bottom',
        loadComponent: () => import('./wardrobe/add-bottom/add-bottom.page').then((m) => m.AddBottomPage),
      },
      {
        path: 'wardrobe/shoes',
        loadComponent: () => import('./wardrobe/shoes/shoes.page').then((m) => m.ShoesPage),
      },
      {
        path: 'wardrobe/add-shoes',
        loadComponent: () => import('./wardrobe/add-shoes/add-shoes.page').then((m) => m.AddShoesPage),
      },
      {
        path: 'wardrobe/accessories',
        loadComponent: () => import('./wardrobe/accessories/accessories.page').then((m) => m.AccessoriesPage),
      },
      {
        path: 'wardrobe/add-accessory',
        loadComponent: () => import('./wardrobe/add-accessory/add-accessory.page').then((m) => m.AddAccessoryPage),
      },
      {
        path: 'wardrobe/upper-garment-detail',
        loadComponent: () => import('./wardrobe/upper-garment-detail/upper-garment-detail.page').then((m) => m.UpperGarmentDetailPage),
      },
      {
        path: 'wardrobe/bottom-detail',
        loadComponent: () => import('./wardrobe/bottom-detail/bottom-detail.page').then((m) => m.BottomDetailPage),
      },
      {
        path: 'wardrobe/shoe-detail',
        loadComponent: () => import('./wardrobe/shoe-detail/shoe-detail.page').then((m) => m.ShoeDetailPage),
      },
      {
        path: 'wardrobe/accessory-detail',
        loadComponent: () => import('./wardrobe/accessory-detail/accessory-detail.page').then((m) => m.AccessoryDetailPage),
      },
      {
        path: 'wardrobe/ai-cleanup',
        loadComponent: () => import('./wardrobe/ai-cleanup/ai-cleanup.page').then((m) => m.AICleanupPage),
      },
      {
        path: 'outfits',
        loadComponent: () => import('./outfits/outfits.page').then((m) => m.OutfitsPage),
      },
      {
        path: 'outfits/create-outfit',
        loadComponent: () => import('./outfits/create-outfit/create-outfit.page').then((m) => m.CreateOutfitPage),
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
