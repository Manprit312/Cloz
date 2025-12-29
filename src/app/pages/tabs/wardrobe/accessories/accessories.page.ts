import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonThumbnail,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { WardrobeService, WardrobeItem } from '../../../../core/services/wardrobe.service';
import { SubtypesService } from '../../../../core/services/subtypes.service';
import { ProfileService } from '../../../../core/services/profile.service';

export interface AccessoryItem {
  id: string;
  imageUrl: string;
  imageUrls?: string[]; // For multiple images (carousel)
  originalImageUrl?: string; // Original image before AI cleanup
  subtype: string;
  color: string;
  climateFit: string[];
  brand?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-accessories',
  templateUrl: './accessories.page.html',
  styleUrls: ['./accessories.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonThumbnail,
    IonFab,
    IonFabButton,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IconComponent,
    EmptyStateComponent,
    ButtonComponent,
  ],
})
export class AccessoriesPage implements OnInit, ViewWillEnter {
  private location = inject(Location);
  private router = inject(Router);
  private wardrobeService = inject(WardrobeService);
  private subtypesService = inject(SubtypesService);
  private profileService = inject(ProfileService);
  
  selectedSubtype: string = 'All';
  // Track current image index for each item in carousel
  itemImageIndices: Map<string, number> = new Map();
  // Track touch start positions for swipe gestures
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;
  
  items: AccessoryItem[] = [];
  isLoading = false;
  error: string | null = null;

  /**
   * Get available subtypes for accessories based on user's gender
   */
  get subtypes(): string[] {
    const gender = this.profileService.profile().gender;
    return this.subtypesService.getSubtypesForCategory('accessories', gender);
  }

  /**
   * Get subtypes that have at least one item in the current items array
   * Always includes "All" as the first option
   */
  get availableSubtypes(): string[] {
    const allSubtypes = this.subtypes;
    const subtypesWithData = allSubtypes.filter(subtype => 
      this.items.some(item => item.subtype === subtype)
    );
    return ['All', ...subtypesWithData];
  }

  ngOnInit(): void {
    this.loadAccessories();
  }

  /**
   * Reload items when page becomes visible (e.g., after adding/updating/deleting an accessory)
   */
  ionViewWillEnter(): void {
    this.loadAccessories();
  }

  /**
   * Load accessories from the API
   */
  loadAccessories(): void {
    this.isLoading = true;
    this.error = null;
    
    this.wardrobeService.getAccessories().subscribe({
      next: (items) => {
        console.log('AccessoriesPage - Loaded items:', items);
        // Transform API items to AccessoryItem format
        this.items = items.map((item) => this.transformToAccessoryItem(item));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('AccessoriesPage - Error loading accessories:', err);
        this.error = err.error?.message || 'Failed to load accessories. Please try again.';
        this.isLoading = false;
        // Keep empty array on error
        this.items = [];
      }
    });
  }

  /**
   * Transform WardrobeItem from API to AccessoryItem format
   */
  private transformToAccessoryItem(item: WardrobeItem): AccessoryItem {
    // Handle climateFit - could be string or array
    const climateFit = Array.isArray(item.climateFit) 
      ? item.climateFit 
      : typeof item.climateFit === 'string' 
        ? item.climateFit.split(',').map(c => c.trim())
        : [];

    return {
      id: item.id,
      imageUrl: item.imageUrl || item.imageUrls?.[0] || '',
      imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : undefined),
      subtype: item.subtype,
      color: item.color,
      climateFit: climateFit,
      brand: item.brand,
      createdAt: item.createdAt,
    };
  }

  get filteredItems(): AccessoryItem[] {
    if (this.selectedSubtype === 'All') {
      return this.items;
    }
    return this.items.filter(item => item.subtype === this.selectedSubtype);
  }

  goBack(): void {
    this.location.back();
  }

  onAddItem(): void {
    this.router.navigate(['/tabs/wardrobe/add-accessory']);
  }

  onItemClick(item: AccessoryItem): void {
    this.router.navigate(['/tabs/wardrobe/accessory-detail'], {
      state: { item },
    });
  }

  selectSubtype(subtype: string): void {
    this.selectedSubtype = subtype;
  }

  hasMultipleImages(item: AccessoryItem): boolean {
    return !!(item.imageUrls && item.imageUrls.length > 1);
  }

  getImages(item: AccessoryItem): string[] {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls;
    }
    return [item.imageUrl];
  }

  getCurrentImageIndex(item: AccessoryItem): number {
    const index = this.itemImageIndices.get(item.id);
    return index !== undefined ? index : 0;
  }

  getCurrentImage(item: AccessoryItem): string {
    const images = this.getImages(item);
    const index = this.getCurrentImageIndex(item);
    return images[index] || item.imageUrl;
  }

  onTouchStart(event: TouchEvent, item: AccessoryItem): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent, item: AccessoryItem): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe(item);
  }

  private handleSwipe(item: AccessoryItem): void {
    if (!this.hasMultipleImages(item)) return;

    const swipeDistance = this.touchStartX - this.touchEndX;
    const images = this.getImages(item);
    let currentIndex = this.getCurrentImageIndex(item);

    if (Math.abs(swipeDistance) > this.SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        currentIndex = (currentIndex + 1) % images.length;
      } else {
        // Swipe right - previous image
        currentIndex = (currentIndex - 1 + images.length) % images.length;
      }
      this.itemImageIndices.set(item.id, currentIndex);
    }
  }
}
