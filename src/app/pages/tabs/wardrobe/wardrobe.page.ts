import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonList,
  ToastController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CountBadgeComponent } from '../../../shared/components/count-badge/count-badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { WardrobeService, WardrobeItem } from '../../../core/services/wardrobe.service';
import { inject } from '@angular/core';

interface WardrobeCategory {
  name: string;
  count: number;
  route: string;
  type: string; // API type identifier
  previewImages: string[];
  remainingCount: number;
}

@Component({
  selector: 'app-wardrobe',
  templateUrl: './wardrobe.page.html',
  styleUrls: ['./wardrobe.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonList,
    IconComponent,
    CountBadgeComponent,
    SkeletonLoaderComponent,
    CommonModule,
    FormsModule,
  ],
})
export class WardrobePage implements OnInit {
  isLoading = false;
  useCardView = false;
  categories: WardrobeCategory[] = [
    {
      name: 'Top garments',
      count: 0,
      route: '/tabs/wardrobe/upper-garments',
      type: 'upper_garments',
      previewImages: [],
      remainingCount: 0,
    },
    {
      name: 'Bottoms',
      count: 0,
      route: '/tabs/wardrobe/bottoms',
      type: 'bottoms',
      previewImages: [],
      remainingCount: 0,
    },
    {
      name: 'Shoes',
      count: 0,
      route: '/tabs/wardrobe/shoes',
      type: 'shoes',
      previewImages: [],
      remainingCount: 0,
    },
    {
      name: 'Accessories',
      count: 0,
      route: '/tabs/wardrobe/accessories',
      type: 'accessories',
      previewImages: [],
      remainingCount: 0,
    },
  ];

  private router = inject(Router);
  private wardrobeService = inject(WardrobeService);
  private toastController = inject(ToastController);

  async ngOnInit() {
    // Show login/signup success as toast
    const showLoginSuccess = sessionStorage.getItem('showLoginSuccess');
    const isSignup = sessionStorage.getItem('isSignup');

    if (showLoginSuccess === 'true') {
      const message = isSignup === 'true' ? 'Successfully signed up' : 'Successfully logged in';
      sessionStorage.removeItem('showLoginSuccess');
      sessionStorage.removeItem('isSignup');

      const toast = await this.toastController.create({
        message,
        color: 'success',
        duration: 5000,
        position: 'top',
        icon: 'checkmark-outline',
      });
      await toast.present();
    }

    // Load category counts
    this.loadCategoryCounts();
  }

  /**
   * Reload category counts when page becomes visible (e.g., after adding/updating items)
   */
  ionViewWillEnter(): void {
    this.loadCategoryCounts();
  }

  /**
   * Load counts for all wardrobe categories
   * Makes requests sequentially with delays to avoid rate limiting (429 errors)
   */
  loadCategoryCounts(): void {
    this.isLoading = true;

    // Create an array of category load functions with their types
    const categoryLoaders = [
      { type: 'upper_garments', loader: () => this.wardrobeService.getUpperGarments() },
      { type: 'bottoms', loader: () => this.wardrobeService.getBottoms() },
      { type: 'shoes', loader: () => this.wardrobeService.getShoes() },
      { type: 'accessories', loader: () => this.wardrobeService.getAccessories() },
    ];

    // Track how many requests have completed
    let completedCount = 0;
    const totalRequests = categoryLoaders.length;

    // Process each category sequentially with 300ms delay between requests
    categoryLoaders.forEach((categoryLoader, index) => {
      const delayTime = index * 300; // 300ms delay between requests to avoid rate limiting
      
      setTimeout(() => {
        categoryLoader.loader().subscribe({
          next: (items) => {
            const category = this.categories.find((cat) => cat.type === categoryLoader.type);
            if (category) {
              if (Array.isArray(items)) {
                category.count = items.length;
                category.previewImages = this.getPreviewImages(items);
                category.remainingCount = Math.max(0, category.count - category.previewImages.length);
                console.log(`WardrobePage - ${category.name} count set to:`, category.count);
              } else {
                console.warn(`WardrobePage - ${category.name} items is not an array:`, items);
                category.count = 0;
                category.previewImages = [];
                category.remainingCount = 0;
              }
            }
            
            completedCount++;
            // Set loading to false after all requests complete
            if (completedCount === totalRequests) {
              this.isLoading = false;
              this.updateViewMode();
            }
          },
          error: (err) => {
            console.error(`WardrobePage - Error loading ${categoryLoader.type}:`, err);
            const category = this.categories.find((cat) => cat.type === categoryLoader.type);
            if (category) {
              category.count = 0; // Set to 0 on error
              category.previewImages = [];
              category.remainingCount = 0;
            }
            
            completedCount++;
            // Set loading to false after all requests complete (even on errors)
            if (completedCount === totalRequests) {
              this.isLoading = false;
              this.updateViewMode();
            }
          },
        });
      }, delayTime);
    });
  }

  goToCategory(route: string): void {
    this.router.navigate([route]);
  }

  private updateViewMode(): void {
    const totalCount = this.categories.reduce((sum, category) => sum + category.count, 0);
    this.useCardView = totalCount > 5;
  }

  private getPreviewImages(items: WardrobeItem[]): string[] {
    return items
      .map((item) => this.getItemImage(item))
      .filter((url): url is string => Boolean(url))
      .slice(0, 3);
  }

  private getItemImage(item: WardrobeItem): string | null {
    if (item.imageUrl && item.imageUrl.trim() !== '') {
      return item.imageUrl;
    }
    if (item.imageUrls && item.imageUrls.length > 0) {
      const first = item.imageUrls.find((url) => url && url.trim() !== '');
      return first || null;
    }
    return null;
  }
}
