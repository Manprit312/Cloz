import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonButtons,
  IonButton,
  IonThumbnail,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonToolbar,
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
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { WardrobeService, WardrobeItem } from '../../../../core/services/wardrobe.service';
import { SubtypesService } from '../../../../core/services/subtypes.service';
import { ProfileService } from '../../../../core/services/profile.service';
;

export interface ShoeItem {
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
  selector: 'app-shoes',
  templateUrl: './shoes.page.html',
  styleUrls: ['./shoes.page.scss'],
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
    SkeletonLoaderComponent,
  ],
})
export class ShoesPage implements OnInit, ViewWillEnter {
  private location = inject(Location);
  private router = inject(Router);
  private wardrobeService = inject(WardrobeService);
  private subtypesService = inject(SubtypesService);
  private profileService = inject(ProfileService);
  
  selectedSubtype: string = 'All';
  // Track current image index for each item in carousel
  itemImageIndices: Map<string, number> = new Map();
  // Track which items have loaded their images
  loadedImages: Set<string> = new Set();
  // Track touch start positions for swipe gestures
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartTime = 0;
  private touchEndTime = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly CLICK_MAX_TIME = 300; // Max time for a click (ms)
  
  items: ShoeItem[] = [];
  isLoading = false;
  error: string | null = null;

  /**
   * Get available subtypes for shoes based on user's gender
   */
  get subtypes(): string[] {
    const gender = this.profileService.profile().gender;
    return this.subtypesService.getSubtypesForCategory('shoes', gender);
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
    this.loadShoes();
  }

  /**
   * Reload items when page becomes visible (e.g., after adding/updating/deleting a shoe)
   */
  ionViewWillEnter(): void {
    this.loadShoes();
  }

  /**
   * Load shoes from the API
   */
  loadShoes(): void {
    this.isLoading = true;
    this.error = null;
    // Clear loaded images when reloading
    this.loadedImages.clear();
    
    this.wardrobeService.getShoes().subscribe({
      next: (items) => {
        console.log('ShoesPage - Loaded items:', items);
        // Transform API items to ShoeItem format
        this.items = items.map((item) => this.transformToShoeItem(item));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ShoesPage - Error loading shoes:', err);
        this.error = err.error?.message || 'Failed to load shoes. Please try again.';
        this.isLoading = false;
        // Keep empty array on error
        this.items = [];
      }
    });
  }

  /**
   * Check if an item's image has loaded
   */
  isImageLoaded(item: ShoeItem): boolean {
    return this.loadedImages.has(item.id);
  }

  /**
   * Handle image load event
   */
  onImageLoad(item: ShoeItem): void {
    this.loadedImages.add(item.id);
  }

  /**
   * Transform WardrobeItem from API to ShoeItem format
   */
  private transformToShoeItem(item: WardrobeItem): ShoeItem {
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

  get filteredItems(): ShoeItem[] {
    if (this.selectedSubtype === 'All') {
      return this.items;
    }
    return this.items.filter(item => item.subtype === this.selectedSubtype);
  }

  goBack(): void {
    this.location.back();
  }

  onAddItem(): void {
    this.router.navigate(['/tabs/wardrobe/add-shoes']);
  }

  onItemClick(item: ShoeItem): void {
    this.router.navigate(['/tabs/wardrobe/shoe-detail'], {
      state: { item },
    });
  }

  selectSubtype(subtype: string): void {
    this.selectedSubtype = subtype;
  }

  hasMultipleImages(item: ShoeItem): boolean {
    return !!(item.imageUrls && item.imageUrls.length > 1);
  }

  getImages(item: ShoeItem): string[] {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls;
    }
    return [item.imageUrl];
  }

  getCurrentImageIndex(item: ShoeItem): number {
    const index = this.itemImageIndices.get(item.id);
    return index !== undefined ? index : 0;
  }

  getCurrentImage(item: ShoeItem): string {
    const images = this.getImages(item);
    const index = this.getCurrentImageIndex(item);
    return images[index] || item.imageUrl;
  }

  onTouchStart(event: TouchEvent, item: ShoeItem): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartTime = Date.now();
  }

  onTouchEnd(event: TouchEvent, item: ShoeItem): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndTime = Date.now();
    this.handleSwipe(item);
  }

  onCarouselClick(event: Event, item: ShoeItem): void {
    // Only navigate if it's a click (not a swipe)
    // Check if this was a swipe by looking at touch distance and duration
    const touchDistance = Math.abs(this.touchStartX - this.touchEndX);
    const touchDuration = this.touchEndTime - this.touchStartTime;
    const wasSwipe = touchDistance > this.SWIPE_THRESHOLD && touchDuration < this.CLICK_MAX_TIME;
    
    if (!wasSwipe) {
      // Prevent event from bubbling to parent (which would cause double navigation)
      event.stopPropagation();
      this.onItemClick(item);
    }
    // If it was a swipe, do nothing (swipe already handled in onTouchEnd)
  }

  private handleSwipe(item: ShoeItem): void {
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
