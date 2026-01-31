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
import { Router, ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CountBadgeComponent } from '../../../shared/components/count-badge/count-badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { WardrobeService, WardrobeItem } from '../../../core/services/wardrobe.service';
import { AdminWardrobeContextService } from '../../../core/services/admin-wardrobe-context.service';
import { AdminService } from '../../../core/services/admin.service';
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
    { name: 'Upper garments', count: 0, route: '/tabs/wardrobe/upper-garments', type: 'upper_garments', previewImages: [], remainingCount: 0 },
    { name: 'Bottoms', count: 0, route: '/tabs/wardrobe/bottoms', type: 'bottoms', previewImages: [], remainingCount: 0 },
    { name: 'Shoes', count: 0, route: '/tabs/wardrobe/shoes', type: 'shoes', previewImages: [], remainingCount: 0 },
    { name: 'Accessories', count: 0, route: '/tabs/wardrobe/accessories', type: 'accessories', previewImages: [], remainingCount: 0 },
  ];

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private wardrobeService = inject(WardrobeService);
  private adminService = inject(AdminService);
  private adminContext = inject(AdminWardrobeContextService);
  private toastController = inject(ToastController);

  get isAdminMode(): boolean {
    return this.adminContext.isAdminMode();
  }

  private get adminUserId(): string | null {
    return this.adminContext.userId();
  }

  async ngOnInit() {
    if (!this.isAdminMode) {
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
    }
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
   */
  loadCategoryCounts(): void {
    this.isLoading = true;

    if (this.isAdminMode && this.adminUserId) {
      this.adminService.getAdminWardrobe(this.adminUserId).subscribe({
        next: (items) => {
          this.buildCategoriesFromItems(items);
          this.isLoading = false;
          this.updateViewMode();
        },
        error: () => {
          this.categories.forEach((c) => { c.count = 0; c.previewImages = []; c.remainingCount = 0; });
          this.isLoading = false;
          this.updateViewMode();
        },
      });
      return;
    }

    const categoryLoaders = [
      { type: 'upper_garments', loader: () => this.wardrobeService.getUpperGarments() },
      { type: 'bottoms', loader: () => this.wardrobeService.getBottoms() },
      { type: 'shoes', loader: () => this.wardrobeService.getShoes() },
      { type: 'accessories', loader: () => this.wardrobeService.getAccessories() },
    ];
    let completedCount = 0;
    const totalRequests = categoryLoaders.length;

    categoryLoaders.forEach((cl, index) => {
      setTimeout(() => {
        cl.loader().subscribe({
          next: (items) => {
            this.updateCategoryFromItems(cl.type, items);
            if (++completedCount === totalRequests) {
              this.isLoading = false;
              this.updateViewMode();
            }
          },
          error: () => {
            this.updateCategoryFromItems(cl.type, []);
            if (++completedCount === totalRequests) {
              this.isLoading = false;
              this.updateViewMode();
            }
          },
        });
      }, index * 300);
    });
  }

  private buildCategoriesFromItems(items: WardrobeItem[]): void {
    const typeMap: Record<string, WardrobeItem[]> = {
      upper_garments: [],
      bottoms: [],
      shoes: [],
      accessories: [],
    };
    for (const item of items) {
      const t = (item.type ?? item['type'] ?? '').toLowerCase().replace(/\s+/g, '_');
      if (typeMap[t]) typeMap[t].push(item);
    }
    const uid = this.adminUserId ?? '';
    for (const cat of this.categories) {
      const list = typeMap[cat.type] ?? [];
      cat.count = list.length;
      cat.route = `/admin/wardrobe/${uid}/category/${cat.type}`;
      cat.previewImages = this.getPreviewImages(list);
      cat.remainingCount = Math.max(0, cat.count - cat.previewImages.length);
    }
  }

  private updateCategoryFromItems(type: string, items: WardrobeItem[]): void {
    const cat = this.categories.find((c) => c.type === type);
    if (!cat) return;
    if (this.isAdminMode && this.adminUserId) {
      cat.route = `/admin/wardrobe/${this.adminUserId}/category/${type}`;
    } else {
      const path = type === 'upper_garments' ? 'upper-garments' : type;
      cat.route = `/tabs/wardrobe/${path}`;
    }
    cat.count = Array.isArray(items) ? items.length : 0;
    cat.previewImages = Array.isArray(items) ? this.getPreviewImages(items) : [];
    cat.remainingCount = Math.max(0, cat.count - cat.previewImages.length);
  }

  goToCategory(route: string): void {
    if (route) this.router.navigateByUrl(route);
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
