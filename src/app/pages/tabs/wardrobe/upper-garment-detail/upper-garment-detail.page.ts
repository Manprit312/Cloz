import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSpinner,
  IonToast,
  ModalController,
  AlertController,
  ActionSheetController,
  ViewWillEnter,
  IonBadge,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DetailTabsComponent } from '../../../../shared/components/detail-tabs/detail-tabs.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CountBadgeComponent } from '../../../../shared/components/count-badge/count-badge.component';
import { SubtypeSelectionModalComponent } from '../../../../shared/components/subtype-selection-modal/subtype-selection-modal.component';
import { ColorSelectionModalComponent } from '../../../../shared/components/color-selection-modal/color-selection-modal.component';
import { UpperGarmentItem } from '../upper-garments/upper-garments.page';
import { WardrobeService, WardrobeItem, UpdateWardrobeItemRequest } from '../../../../core/services/wardrobe.service';
import { OutfitsService, Outfit, OutfitWardrobeItem } from '../../../../core/services/outfits.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { ImageCompressionService } from '../../../../core/services/image-compression.service';
import { COLOR_FAMILIES, ColorToken, PRIMARY_COLORS, getColorFamilyAndLevel } from '../../../../shared/constants/color-tokens';
import { inject } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PhotoUpgradeCardComponent } from '../../../../shared/components/photo-upgrade-card/photo-upgrade-card.component';

@Component({
  selector: 'app-upper-garment-detail',
  templateUrl: './upper-garment-detail.page.html',
  styleUrls: ['./upper-garment-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonSpinner,
    IonToast,
    IconComponent,
    ButtonComponent,
    DetailTabsComponent,
    EmptyStateComponent,
    CountBadgeComponent,
    PhotoUpgradeCardComponent,
    IonBadge,
  ],
})
export class UpperGarmentDetailPage implements OnInit, ViewWillEnter {
  item: UpperGarmentItem | null = null;
  showSuccessMessage = false;
  currentImageIndex = 0;
  images: string[] = [];
  brandDraft = '';
  activeTab: 'outfits' | 'details' = 'outfits';
  detailTabs = [
    { id: 'outfits', label: 'Outfits' },
    { id: 'details', label: 'Garment details' },
  ];
  linkedOutfits: Outfit[] = [];
  isLoadingOutfits = false;
  isReplacingImage = false;
  
  // Swipe gesture tracking
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for swipe
  
  private wardrobeService = inject(WardrobeService);
  private outfitsService = inject(OutfitsService);
  private modalController = inject(ModalController);
  private profileService = inject(ProfileService);
  private actionSheetController = inject(ActionSheetController);
  private imageCompressionService = inject(ImageCompressionService);

  constructor(
    private location: Location,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const state = history.state;
    console.log('Detail page - state:', state);
    
    if (state && state.item) {
      this.loadItem(state.item);
    } else {
      // If no item data, go back
      this.location.back();
    }
  }

  /**
   * Reload item from API when page becomes visible (e.g., after edit)
   */
  ionViewWillEnter(): void {
    console.log('Detail page - ionViewWillEnter called, item:', this.item);
    
    // Check if we should show success message BEFORE reloading
    // Only show if explicitly coming from AI cleanup with success flag
    const state = history.state;
    const fromAICleanup = (state?.fromAICleanup === true) || (sessionStorage.getItem('fromAICleanup') === 'true');
    const showSuccessFromState = state?.showSuccess === true;
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
    
    // Reload item from API if we have an item ID
    // This ensures we have the latest data after updates
    if (this.item?.id) {
      console.log('Detail page - Reloading item from API with ID:', this.item.id);
      this.reloadItemFromAPI(this.item.id);
    } else {
      console.log('Detail page - No item ID found, skipping reload');
    }
  }

  /**
   * Load item data (from state or API)
   */
  private loadItem(item: UpperGarmentItem): void {
    this.item = item;
    this.brandDraft = item.brand || '';
    console.log('Detail page - item:', this.item);
    console.log('Detail page - imageUrls:', item.imageUrls);
    console.log('Detail page - imageUrl:', item.imageUrl);
    
    this.initializeImages();
    this.loadLinkedOutfits();
    console.log('Detail page - images array:', this.images);
    console.log('Detail page - hasMultipleImages:', this.hasMultipleImages);
    console.log('Detail page - images length:', this.images.length);
  }

  /**
   * Reload item from API to get latest data after update
   */
  private reloadItemFromAPI(itemId: string): void {
    console.log('Detail page - reloadItemFromAPI called for ID:', itemId);
    // Fetch all items and find the one with matching ID
    this.wardrobeService.getUpperGarments().subscribe({
      next: (items) => {
        console.log('Detail page - Fetched items from API, count:', items.length);
        const updatedItem = items.find(item => item.id === itemId);
        if (updatedItem) {
          console.log('Detail page - Found updated item:', updatedItem);
          // Transform to UpperGarmentItem format
          const transformedItem = this.transformToUpperGarmentItem(updatedItem);
          this.loadItem(transformedItem);
          this.loadLinkedOutfits();
          console.log('Detail page - ✅ Item successfully reloaded from API:', transformedItem);
        } else {
          console.warn('Detail page - Item not found in API response with ID:', itemId);
        }
      },
      error: (err) => {
        console.error('Detail page - ❌ Error reloading item:', err);
        // Don't show error to user, just keep existing data
      }
    });
  }

  /**
   * Transform WardrobeItem from API to UpperGarmentItem format
   */
  private transformToUpperGarmentItem(item: WardrobeItem): UpperGarmentItem {
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
      const images = this.getOrderedImages();
      this.images = images;
      this.currentImageIndex = 0;
      
      // Log for debugging
      console.log('Initialized images:', this.images);
      console.log('Current image index:', this.currentImageIndex);
      console.log('Has multiple images:', this.hasMultipleImages);
    }
  }

  private getOrderedImages(): string[] {
    if (!this.item) {
      return [];
    }
    const images: string[] = [];
    if (this.item.imageUrl) {
      images.push(this.item.imageUrl);
    }
    if (this.item.imageUrls && this.item.imageUrls.length > 0) {
      images.push(...this.item.imageUrls);
    }
    return [...new Set(images.filter(url => url && url.trim() !== ''))];
  }

  get currentImage(): string {
    return this.images[this.currentImageIndex] || '';
  }

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }

  /** Delete icon: shown on all images except the last when there are multiple images. */
  get showDeleteAiIcon(): boolean {
    return !!this.currentImage && this.images.length > 1 && this.currentImageIndex < this.images.length - 1;
  }

  /** Autorenew icon: shown when only one image, or when on the last image. */
  get showAutorenewIcon(): boolean {
    return !!this.currentImage && (this.images.length === 1 || this.currentImageIndex === this.images.length - 1);
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

  setActiveTab(tab: string): void {
    if (tab === 'outfits' || tab === 'details') {
      this.activeTab = tab;
    }
  }

  get colorBackground(): string | null {
    const token = this.findColorToken(this.item?.color || '');
    if (!token || !token.hex || token.hex === 'print') {
      return null;
    }
    return token.hex;
  }

  get colorTextColor(): string {
    const background = this.colorBackground;
    if (!background) {
      return 'var(--ion-text-color)';
    }
    return this.getContrastTextColor(background);
  }

  async onEditSubtype(): Promise<void> {
    if (!this.item) {
      return;
    }
    const modal = await this.modalController.create({
      component: SubtypeSelectionModalComponent,
      componentProps: {
        currentSubtype: this.item.subtype,
        category: 'upper-garments',
        gender: this.profileService.profile().gender,
      },
      showBackdrop: true,
      breakpoints: [0, 0.6, 1],
      initialBreakpoint: 0.6,
      backdropBreakpoint: 0,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data && this.item?.id) {
      this.updateItemFields({ subtype: data });
    }
  }

  async onEditColor(): Promise<void> {
    if (!this.item) {
      return;
    }
    const currentColor = this.item.color || '';
    const atSaturation = !!getColorFamilyAndLevel(currentColor);
    const modal = await this.modalController.create({
      component: ColorSelectionModalComponent,
      componentProps: {
        currentColor,
      },
      showBackdrop: true,
      breakpoints: [0.27, 0.4, 0.8],
      initialBreakpoint: atSaturation ? 0.27 : 0.8,
      backdropBreakpoint: 0.27,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data && this.item?.id) {
      this.updateItemFields({ color: data });
    }
  }

  onBrandBlur(): void {
    if (!this.item?.id) {
      return;
    }
    const brand = (this.brandDraft || '').trim();
    if ((this.item.brand || '') === brand) {
      return;
    }
    this.updateItemFields({ brand });
  }

  dismissKeyboard(): void {
    Keyboard.hide();
  }

  private updateItemFields(update: UpdateWardrobeItemRequest): void {
    if (!this.item?.id) {
      return;
    }
    this.wardrobeService.updateItem(this.item.id, update).subscribe({
      next: () => {
        this.reloadItemFromAPI(this.item!.id);
      },
      error: (err) => {
        console.error('Upper garment detail page - Error updating item:', err);
      },
    });
  }

  private findColorToken(colorValue: string): ColorToken | undefined {
    if (!colorValue) {
      return undefined;
    }
    const normalized = colorValue.trim().toLowerCase();
    for (const family of COLOR_FAMILIES) {
      for (const level of family.levels) {
        const token = level.variations.find(
          (variation) =>
            variation.value.toLowerCase() === normalized ||
            variation.label.toLowerCase() === normalized
        );
        if (token) {
          return token;
        }
      }
    }
    return PRIMARY_COLORS.find(
      (token) =>
        token.value.toLowerCase() === normalized ||
        token.label.toLowerCase() === normalized
    );
  }

  private getContrastTextColor(hexColor: string): string {
    if (!hexColor.startsWith('#') || hexColor.length !== 7) {
      return 'var(--ion-text-color)';
    }
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#111111' : '#ffffff';
  }

  private loadLinkedOutfits(): void {
    if (!this.item?.id) {
      this.linkedOutfits = [];
      return;
    }
    this.isLoadingOutfits = true;
    this.outfitsService.getOutfits().subscribe({
      next: (outfits) => {
        this.linkedOutfits = outfits.filter(outfit =>
          outfit.outfitWardrobe?.some(category =>
            category.items?.some(item => item.id === this.item?.id)
          )
        );
        this.isLoadingOutfits = false;
      },
      error: (err) => {
        console.error('Upper garment detail page - Error loading outfits:', err);
        this.linkedOutfits = [];
        this.isLoadingOutfits = false;
      },
    });
  }

  getOutfitGarments(outfit: Outfit): OutfitWardrobeItem[] {
    if (outfit.outfitWardrobe && Array.isArray(outfit.outfitWardrobe)) {
      const allItems: OutfitWardrobeItem[] = [];
      outfit.outfitWardrobe.forEach((category) => {
        if (category.items && Array.isArray(category.items)) {
          allItems.push(...category.items);
        }
      });
      return allItems;
    }
    return [];
  }

  getGarmentImage(item: OutfitWardrobeItem): string {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const sortedImages = [...item.images].sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      return sortedImages[0].imageUrl || '';
    }
    return item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : '');
  }

  onOutfitClick(outfit: Outfit): void {
    if (!outfit.id) {
      return;
    }
    this.router.navigate(['/tabs/outfits/outfit-detail', outfit.id], {
      state: { outfit },
    });
  }

  onUseInOutfit(): void {
    if (!this.item) {
      return;
    }
    this.router.navigate(['/tabs/outfits/create-outfit'], {
      state: {
        prefillGarment: {
          category: 'upper-garments',
          item: this.item,
        },
      },
    });
  }

  onSuccessToastDismiss(): void {
    this.showSuccessMessage = false;
  }

  async onAICleanup(): Promise<void> {
    if (!this.item) {
      return;
    }
    this.router.navigate(['/tabs/wardrobe/ai-cleanup'], {
      state: { item: this.item },
    });
  }

  onEdit(): void {
    if (this.item) {
      this.router.navigate(['/tabs/wardrobe/add-upper-garment'], {
        state: { garmentData: this.item },
      });
    }
  }

  /** Replace image: show Take Photo / Choose from Gallery, then update garment with new image. */
  async onReplaceImage(): Promise<void> {
    if (!this.item?.id) return;
    const actionSheet = await this.actionSheetController.create({
      header: 'Replace image',
      buttons: [
        { text: 'Take Photo', icon: 'camera', handler: () => this.takePhotoForReplace() },
        { text: 'Choose from Gallery', icon: 'images', handler: () => this.chooseFromGalleryForReplace() },
        { text: 'Cancel', icon: 'close', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private async takePhotoForReplace(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      if (image.webPath) await this.processImageForReplace(image.webPath);
    } catch (err) {
      console.error('Error taking photo for replace:', err);
      if ((err as { message?: string })?.message !== 'User cancelled photos app') {
        this.showReplaceError();
      }
    }
  }

  private async chooseFromGalleryForReplace(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });
      if (image.webPath) await this.processImageForReplace(image.webPath);
    } catch (err) {
      console.error('Error choosing from gallery for replace:', err);
      if ((err as { message?: string })?.message !== 'User cancelled photos app') {
        this.showReplaceError();
      }
    }
  }

  private async processImageForReplace(webPath: string): Promise<void> {
    if (!this.item?.id) return;
    this.isReplacingImage = true;
    try {
      const response = await fetch(webPath);
      const blob = await response.blob();
      const file = new File([blob], 'garment-image.jpg', { type: 'image/jpeg' });
      const compressed = await this.imageCompressionService.compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.7,
        maxSizeMB: 1,
      });
      this.wardrobeService.updateItem(this.item.id, { image: compressed }).subscribe({
        next: () => {
          this.isReplacingImage = false;
          this.showSuccessMessage = true;
          this.reloadItemFromAPI(this.item!.id);
        },
        error: (err) => {
          this.isReplacingImage = false;
          console.error('Error updating garment image:', err);
          this.showReplaceError();
        },
      });
    } catch (err) {
      this.isReplacingImage = false;
      console.error('Error processing image for replace:', err);
      this.showReplaceError();
    }
  }

  private async showReplaceError(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Could not replace image. Please try again.',
      buttons: ['OK'],
    });
    await alert.present();
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

  onDeleteAiImage(): void {
    if (!this.item?.id || !this.currentImage) return;
    this.wardrobeService.cancelGarmentImage(this.currentImage).subscribe({
      next: () => {
        try {
          localStorage.removeItem(`aiCleanedImage:${this.item!.id}`);
          sessionStorage.removeItem(`aiCleanedImage:${this.item!.id}`);
        } catch {}
        this.reloadItemFromAPI(this.item!.id);
      },
      error: (err) => {
        console.error('Upper garment detail page - Error deleting AI image:', err);
      },
    });
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

