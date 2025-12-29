import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  AlertController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DetailItemComponent } from '../../../../shared/components/detail-item/detail-item.component';
import { AccessoryItem } from '../accessories/accessories.page';
import { WardrobeService, WardrobeItem } from '../../../../core/services/wardrobe.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-accessory-detail',
  templateUrl: './accessory-detail.page.html',
  styleUrls: ['./accessory-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IconComponent,
    ButtonComponent,
    DetailItemComponent,
  ],
})
export class AccessoryDetailPage implements OnInit, ViewWillEnter {
  item: AccessoryItem | null = null;
  showSuccessMessage = false;
  currentImageIndex = 0;
  images: string[] = [];
  
  // Swipe gesture tracking
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for swipe

  private wardrobeService = inject(WardrobeService);

  constructor(
    private location: Location,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const state = history.state;
    console.log('Detail page - state:', state);
    
    if (state && state.item) {
      this.item = state.item;
      console.log('Detail page - item:', this.item);
      console.log('Detail page - imageUrls:', state.item.imageUrls);
      console.log('Detail page - imageUrl:', state.item.imageUrl);
      
      this.initializeImages();
      console.log('Detail page - images array:', this.images);
      console.log('Detail page - hasMultipleImages:', this.hasMultipleImages);
      console.log('Detail page - images length:', this.images.length);
      
      // Check if we should show success message
      // Only show if explicitly coming from AI cleanup with success flag
      const fromAICleanup = state.fromAICleanup === true || sessionStorage.getItem('fromAICleanup') === 'true';
      const showSuccessFromState = state.showSuccess === true;
      const showSuccessFromStorage = sessionStorage.getItem('showImageUpdateSuccess') === 'true';
      
      // Only show banner if coming from AI cleanup AND success flag is set
      if (fromAICleanup && (showSuccessFromState || showSuccessFromStorage)) {
        console.log('Detail page - showing success banner');
        this.showSuccessMessage = true;
        // Clear sessionStorage flags
        sessionStorage.removeItem('showImageUpdateSuccess');
        sessionStorage.removeItem('fromAICleanup');
        
        // Scroll to top to ensure success banner is visible
        setTimeout(() => {
          const content = document.querySelector('ion-content');
          if (content) {
            content.scrollToTop(300);
          }
        }, 100);
        // Hide message after 5 seconds with fade out
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 5000);
      }
    } else {
      // If no item data, go back
      this.location.back();
    }
  }

  /**
   * Reload item from API when page becomes visible (e.g., after edit)
   */
  ionViewWillEnter(): void {
    console.log('Accessory detail page - ionViewWillEnter called, item:', this.item);
    // Reload item from API if we have an item ID
    // This ensures we have the latest data after updates
    if (this.item?.id) {
      console.log('Accessory detail page - Reloading item from API with ID:', this.item.id);
      this.reloadItemFromAPI(this.item.id);
    } else {
      console.log('Accessory detail page - No item ID found, skipping reload');
    }
  }

  /**
   * Reload item from API to get latest data after update
   */
  private reloadItemFromAPI(itemId: string): void {
    console.log('Accessory detail page - reloadItemFromAPI called for ID:', itemId);
    // Fetch all items and find the one with matching ID
    this.wardrobeService.getAccessories().subscribe({
      next: (items) => {
        console.log('Accessory detail page - Fetched items from API, count:', items.length);
        const updatedItem = items.find(item => item.id === itemId);
        if (updatedItem) {
          console.log('Accessory detail page - Found updated item:', updatedItem);
          // Transform to AccessoryItem format
          const transformedItem = this.transformToAccessoryItem(updatedItem);
          this.item = transformedItem;
          this.initializeImages();
          console.log('Accessory detail page - ✅ Item successfully reloaded from API:', transformedItem);
        } else {
          console.warn('Accessory detail page - Item not found in API response with ID:', itemId);
        }
      },
      error: (err) => {
        console.error('Accessory detail page - ❌ Error reloading item:', err);
        // Don't show error to user, just keep existing data
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

  initializeImages() {
    if (this.item) {
      // If item has multiple images, use them; otherwise use single imageUrl
      if (this.item.imageUrls && this.item.imageUrls.length > 0) {
        // Filter out duplicate URLs to ensure we have unique images
        this.images = [...new Set(this.item.imageUrls.filter(url => url && url.trim() !== ''))];
        // Set current index to the primary image (imageUrl) if it exists in the array
        const primaryIndex = this.images.findIndex(img => img === this.item?.imageUrl);
        this.currentImageIndex = primaryIndex >= 0 ? primaryIndex : this.images.length - 1; // Default to last (most recent/cleaned) image
      } else if (this.item.imageUrl) {
        this.images = [this.item.imageUrl];
        this.currentImageIndex = 0;
      }
      
      // Ensure we have at least one image
      if (this.images.length === 0 && this.item.imageUrl) {
        this.images = [this.item.imageUrl];
        this.currentImageIndex = 0;
      }
      
      // Log for debugging
      console.log('Initialized images:', this.images);
      console.log('Current image index:', this.currentImageIndex);
      console.log('Has multiple images:', this.hasMultipleImages);
    }
  }

  get currentImage(): string {
    return this.images[this.currentImageIndex] || '';
  }

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }
  
  // Swipe gesture handlers for carousel
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }
  
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }
  
  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > this.SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        this.nextImage();
      } else {
        // Swipe right - previous image
        this.previousImage();
      }
    }
  }
  
  nextImage(): void {
    if (this.hasMultipleImages && this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
    }
  }
  
  previousImage(): void {
    if (this.hasMultipleImages && this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }
  
  goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentImageIndex = index;
    }
  }

  goBack(): void {
    this.location.back();
  }

  async onAICleanup(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Try AI cleanup?',
      message: 'This improves your photo; your original is always kept.',
      cssClass: 'ai-cleanup-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Continue',
          cssClass: 'alert-button-confirm',
          handler: () => {
            if (this.item) {
              this.router.navigate(['/tabs/wardrobe/ai-cleanup'], {
                state: { item: this.item },
              });
            }
          },
        },
      ],
    });

    await alert.present();
  }

  onEdit(): void {
    if (this.item) {
      this.router.navigate(['/tabs/wardrobe/add-accessory'], {
        state: { garmentData: this.item },
      });
    }
  }

  async onDelete(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Are you sure about deleting this garment?',
      message: "Garment deletion can't be undone.",
      cssClass: 'delete-confirmation-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes, delete',
          role: 'destructive',
          cssClass: 'alert-button-confirm',
          handler: () => {
            if (this.item?.id) {
              this.wardrobeService.deleteItem(this.item.id).subscribe({
                next: () => {
                  console.log('Item deleted successfully:', this.item?.id);
                  // Navigate back after successful deletion
                  this.location.back();
                },
                error: (err) => {
                  console.error('Error deleting item:', err);
                  // Show error alert
                  this.showDeleteError();
                }
              });
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async showDeleteError(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Failed to delete the garment. Please try again.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  get title(): string {
    if (!this.item) return '';
    const parts = [this.item.color, this.item.brand, this.item.subtype].filter(Boolean);
    return parts.join(' ') || this.item.subtype;
  }

  /**
   * Format createdAt date to readable format
   */
  get formattedDate(): string {
    if (!this.item?.createdAt) return 'N/A';
    try {
      const date = new Date(this.item.createdAt);
      // Format as "Dec 19, 2025"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return this.item.createdAt;
    }
  }
}





