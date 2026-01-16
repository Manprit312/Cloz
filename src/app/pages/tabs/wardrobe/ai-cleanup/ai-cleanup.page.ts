import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSpinner,
  AlertController,
  ModalController,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RegenerateModalComponent } from '../../../../shared/components/regenerate-modal/regenerate-modal.component';
import { UpperGarmentItem } from '../upper-garments/upper-garments.page';
import { WardrobeService } from '../../../../core/services/wardrobe.service';

@Component({
  selector: 'app-ai-cleanup',
  templateUrl: './ai-cleanup.page.html',
  styleUrls: ['./ai-cleanup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonSpinner,
    IonButton,
    IconComponent,
    ButtonComponent,
  ],
})
export class AICleanupPage implements OnInit {
  item: UpperGarmentItem | null = null;
  isProcessing = true; // Start with true - auto-start processing
  hasGeneratedImage = false; // Track if image has been generated
  generatedImageUrl: string | null = null; // Store the generated image URL
  regenerateCount = 0;
  maxRegenerations = 2;
  previousDescription: string = '';
  errorMessage: string | null = null;
  isModalPresent = false; // Track if regenerate modal is currently open
  
  get displayImage(): string {
    // Show generated image if available, otherwise show original
    if (this.hasGeneratedImage && this.generatedImageUrl) {
      return this.generatedImageUrl;
    }
    return this.item?.imageUrl || '';
  }

  private wardrobeService = inject(WardrobeService);

  constructor(
    private location: Location,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    const state = history.state;
    if (state && state.item) {
      // Store the original image URL before processing
      // If imageUrls exists, the original is the first one; otherwise use imageUrl
      const originalImageUrl = state.item.originalImageUrl || 
        (state.item.imageUrls && state.item.imageUrls.length > 0 
          ? state.item.imageUrls[0] 
          : state.item.imageUrl);
      
      this.item = {
        ...state.item,
        originalImageUrl: originalImageUrl, // Preserve original
      };
      // Auto-start processing when page loads
      if (this.item) {
      this.startProcessing();
      }
    } else {
      // If no item data, go back
      this.location.back();
    }
  }

  startProcessing() {
    if (!this.item || !this.item.id) {
      console.error('AICleanupPage: Cannot start processing - item or item.id is missing');
      this.errorMessage = 'Invalid item data';
      this.isProcessing = false;
      return;
    }
    
    // Start processing immediately
    this.isProcessing = true;
    this.hasGeneratedImage = false;
    this.errorMessage = null;
    
    // Get the image URL to send to the API
    const imageUrl = this.item.originalImageUrl || this.item.imageUrl;
    
    if (!imageUrl) {
      console.error('AICleanupPage: Cannot start processing - imageUrl is missing');
      this.errorMessage = 'Image URL is required';
      this.isProcessing = false;
      return;
    }
    
    // Call the cleanup API
    this.wardrobeService.cleanupItem(this.item.id, imageUrl).subscribe({
      next: (response) => {
        console.log('AICleanupPage: Cleanup API response:', response);
        
        // Extract the cleaned image URL from the response
        // The API might return it as imageUrl, cleanedImageUrl, or result.imageUrl
        const cleanedImageUrl = response?.imageUrl || 
                                response?.cleanedImageUrl || 
                                response?.result?.imageUrl ||
                                response?.data?.imageUrl;
        
        if (cleanedImageUrl) {
          this.generatedImageUrl = cleanedImageUrl;
      this.hasGeneratedImage = true;
          this.isProcessing = false;
        } else {
          console.error('AICleanupPage: No image URL in API response');
          this.errorMessage = 'Failed to get cleaned image from server';
          this.isProcessing = false;
        }
      },
      error: (error) => {
        console.error('AICleanupPage: Cleanup API error:', error);
        
        // Check for specific HTTP status codes
        let errorMsg = 'Failed to process image. Please try again.';
        
        if (error?.status === 404) {
          errorMsg = 'AI cleanup service is not available. Please contact support or try again later.';
        } else if (error?.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (error?.status === 403) {
          errorMsg = 'You do not have permission to perform this action.';
        } else if (error?.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        // Check if it's a token-related error
        if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('access token') || errorMsg.toLowerCase().includes('authentication')) {
          errorMsg = 'Authentication error. Please log out and log in again.';
        }
        
        this.errorMessage = errorMsg;
        this.isProcessing = false;
        
        // Show error alert
        if (this.errorMessage) {
          this.showErrorAlert(this.errorMessage);
        }
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  async onSetAsImage(): Promise<void> {
    if (!this.item || !this.hasGeneratedImage || !this.generatedImageUrl) {
      return;
    }
    
    // Get the generated image URL
    const generatedImageUrl = this.generatedImageUrl;
    
    if (!this.item.id) {
      console.error('AICleanupPage: Cannot set image - item.id is missing');
      this.showErrorAlert('Invalid item data');
      return;
    }
    
    // Show loading state
    this.isProcessing = true;
    
    // Call the API to set the generated image as permanent
    this.wardrobeService.setGarmentImage(this.item.id, generatedImageUrl).subscribe({
      next: (response) => {
        console.log('AICleanupPage: Set garment image API response:', response);
        
        // Extract the updated wardrobe item from the response
        const updatedWardrobe = response?.data || response;
        
        // Ensure item still exists
        if (!this.item) {
          console.error('AICleanupPage: Item is null after API call');
          this.isProcessing = false;
          this.showErrorAlert('Failed to update item');
          return;
        }
        
        // Transform the backend response to frontend format if needed
        // Backend returns: { images: [{ imageUrl: string, isPrimary: boolean, displayOrder: number }] }
        // Frontend expects: { imageUrl: string, imageUrls: string[] }
        // Use the same transformation logic as WardrobeService.transformWardrobeItem
        let imageUrls: string[] = [];
        
        if (updatedWardrobe.images && Array.isArray(updatedWardrobe.images)) {
          // Sort images: primary first, then by displayOrder (same as WardrobeService)
          const sortedImages = [...updatedWardrobe.images].sort((a, b) => {
            if (a.isPrimary) return -1;
            if (b.isPrimary) return 1;
            return (a.displayOrder || 0) - (b.displayOrder || 0);
          });
          imageUrls = sortedImages.map((img: any) => img.imageUrl || img.url).filter(Boolean);
        } else if (updatedWardrobe.imageUrls && Array.isArray(updatedWardrobe.imageUrls)) {
          imageUrls = updatedWardrobe.imageUrls;
        } else if (this.item?.imageUrls && Array.isArray(this.item.imageUrls)) {
          // Fallback: preserve original images and add the generated one
          imageUrls = [...this.item.imageUrls];
          if (!imageUrls.includes(generatedImageUrl)) {
            imageUrls.unshift(generatedImageUrl); // Add generated image as first
          }
        } else if (this.item?.imageUrl) {
          // If we have original imageUrl but no imageUrls array, create one
          imageUrls = [generatedImageUrl, this.item.imageUrl].filter(Boolean);
    } else {
          // Last resort: use generated image
          imageUrls = [generatedImageUrl];
        }
        
        // Ensure we have at least the generated image
        if (imageUrls.length === 0) {
          imageUrls = [generatedImageUrl];
    }
    
    const updatedItem: UpperGarmentItem = {
      ...this.item,
          ...updatedWardrobe,
          // Ensure imageUrl and imageUrls are set correctly
          imageUrl: updatedWardrobe.imageUrl || imageUrls[0] || generatedImageUrl,
          imageUrls: imageUrls,
    };
    
    console.log('Setting generated image as garment image:', this.item.id);
        console.log('Updated item from API:', updatedItem);
        console.log('Updated item imageUrls:', imageUrls);
        
        // Determine the correct detail page route and wardrobe list route based on item type
        // The item might have a 'type' property or we can infer from the route we came from
        const itemType = (this.item as any).type || (updatedWardrobe as any).type;
        let detailRoute = '/tabs/wardrobe/upper-garment-detail'; // Default
        let wardrobeListRoute = '/tabs/wardrobe/upper-garments'; // Default
        
        if (itemType === 'bottoms' || itemType === 'bottom') {
          detailRoute = '/tabs/wardrobe/bottom-detail';
          wardrobeListRoute = '/tabs/wardrobe/bottoms';
        } else if (itemType === 'shoes' || itemType === 'shoe') {
          detailRoute = '/tabs/wardrobe/shoe-detail';
          wardrobeListRoute = '/tabs/wardrobe/shoes';
        } else if (itemType === 'accessories' || itemType === 'accessory') {
          detailRoute = '/tabs/wardrobe/accessory-detail';
          wardrobeListRoute = '/tabs/wardrobe/accessories';
        } else {
          // Default to upper-garment-detail
          detailRoute = '/tabs/wardrobe/upper-garment-detail';
          wardrobeListRoute = '/tabs/wardrobe/upper-garments';
        }
    
    // Set sessionStorage flag as fallback in case state is lost
    sessionStorage.setItem('showImageUpdateSuccess', 'true');
    sessionStorage.setItem('fromAICleanup', 'true'); // Mark that we're coming from AI cleanup
    
    // Replace the AI cleanup page in history with the wardrobe list route
    // This ensures the back button from detail page goes to wardrobe list, not AI cleanup
    this.location.replaceState(wardrobeListRoute);
    
        // Navigate to the correct detail page with updated image (banner will show on detail page)
        this.router.navigate([detailRoute], {
      state: { 
        item: updatedItem,
        showSuccess: true,
        fromAICleanup: true // Explicitly mark navigation from AI cleanup
      },
        });
      },
      error: (error) => {
        console.error('AICleanupPage: Set garment image API error:', error);
        this.isProcessing = false;
        
        // Check for specific HTTP status codes
        let errorMsg = 'Failed to save image. Please try again.';
        
        if (error?.status === 404) {
          errorMsg = 'Item not found. Please try again.';
        } else if (error?.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (error?.status === 403) {
          errorMsg = 'You do not have permission to perform this action.';
        } else if (error?.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        this.showErrorAlert(errorMsg);
      }
    });
  }

  async onRegenerate(): Promise<void> {
    if (!this.canRegenerate) {
      return;
    }

    // Prevent duplicate modals - check if modal is already present
    if (this.isModalPresent) {
      return;
    }

    // Check for and dismiss any existing modals first
    const existingModal = await this.modalController.getTop();
    if (existingModal) {
      await existingModal.dismiss();
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for dismissal animation
    }

    this.isModalPresent = true;

    // Open regenerate modal
    const modal = await this.modalController.create({
      component: RegenerateModalComponent,
      componentProps: {
        previousDescription: this.previousDescription,
      },
      breakpoints: [0, 0.6, 0.9],
      initialBreakpoint: 0.4,
      backdropBreakpoint: 0.6,
      handle: true,
      handleBehavior: 'cycle',
      cssClass: 'regenerate-modal',
    });

    await modal.present();

    // Use onDidDismiss to ensure modal is fully closed before proceeding
    const { data, role } = await modal.onDidDismiss();

    // Reset flag after a delay to prevent race conditions
    setTimeout(() => {
      this.isModalPresent = false;
      
      // Double-check: if a modal is still present, force dismiss it
      this.modalController.getTop().then((topModal) => {
        if (topModal) {
          topModal.dismiss();
        }
      });
    }, 100);

    if (role === 'confirm' && data?.description) {
      // User confirmed regeneration with description
      this.regenerateCount++;
      this.previousDescription = data.description;
      this.isProcessing = true;
      // TODO: Pass description to AI service
      console.log('Regenerating with description:', data.description);
      
      // Start processing - image will be replaced after completion
      this.startRegeneration();
    }
  }

  startRegeneration() {
    if (!this.item || !this.item.id) {
      console.error('AICleanupPage: Cannot start regeneration - item or item.id is missing');
      this.errorMessage = 'Invalid item data';
      this.isProcessing = false;
      return;
    }
    
    // Start processing for regeneration
    this.isProcessing = true;
    this.errorMessage = null;
    
    // Get the image URL to send to the API
    // Use the original image URL for regeneration
    const imageUrl = this.item.originalImageUrl || this.item.imageUrl;
    
    if (!imageUrl) {
      console.error('AICleanupPage: Cannot start regeneration - imageUrl is missing');
      this.errorMessage = 'Image URL is required';
      this.isProcessing = false;
      return;
    }
    
    // Call the cleanup API for regeneration
    // Note: If the API supports regeneration with description, you might need to pass
    // the previousDescription as an additional parameter
    this.wardrobeService.cleanupItem(this.item.id, imageUrl).subscribe({
      next: (response) => {
        console.log('AICleanupPage: Regeneration API response:', response);
        
        // Extract the cleaned image URL from the response
        const cleanedImageUrl = response?.imageUrl || 
                                response?.cleanedImageUrl || 
                                response?.result?.imageUrl ||
                                response?.data?.imageUrl;
        
        if (cleanedImageUrl) {
          // Update the generated image URL with the regenerated one
          this.generatedImageUrl = cleanedImageUrl;
      this.hasGeneratedImage = true;
          this.isProcessing = false;
        } else {
          console.error('AICleanupPage: No image URL in regeneration API response');
          this.errorMessage = 'Failed to get regenerated image from server';
          this.isProcessing = false;
        }
      },
      error: (error) => {
        console.error('AICleanupPage: Regeneration API error:', error);
        
        // Check for specific HTTP status codes
        let errorMsg = 'Failed to regenerate image. Please try again.';
        
        if (error?.status === 404) {
          errorMsg = 'AI cleanup service is not available. Please contact support or try again later.';
        } else if (error?.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (error?.status === 403) {
          errorMsg = 'You do not have permission to perform this action.';
        } else if (error?.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        // Check if it's a token-related error
        if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('access token') || errorMsg.toLowerCase().includes('authentication')) {
          errorMsg = 'Authentication error. Please log out and log in again.';
        }
        
        this.errorMessage = errorMsg;
        this.isProcessing = false;
        
        // Show error alert
        if (this.errorMessage) {
          this.showErrorAlert(this.errorMessage);
        }
      }
    });
  }

  get canRegenerate(): boolean {
    return this.regenerateCount < this.maxRegenerations;
  }

  get regenerateText(): string {
    return `Regenerate (${this.regenerateCount}/${this.maxRegenerations})`;
  }

  onCancel(): void {
    // If there's a generated image, cancel it via API before navigating back
    if (this.generatedImageUrl) {
      this.wardrobeService.cancelGarmentImage(this.generatedImageUrl).subscribe({
        next: () => {
          console.log('AICleanupPage: Generated image cancelled successfully');
          this.navigateBackToDetail();
        },
        error: (error: any) => {
          console.error('AICleanupPage: Error cancelling generated image:', error);
          // Navigate back even if API call fails
          this.navigateBackToDetail();
        }
      });
    } else {
      // No generated image, just navigate back
      this.navigateBackToDetail();
    }
  }

  private navigateBackToDetail(): void {
    // Navigate back to detail page directly without confirmation alert
    if (this.item) {
      // Determine the correct detail page route and wardrobe list route based on item type
      const itemType = (this.item as any).type;
      let detailRoute = '/tabs/wardrobe/upper-garment-detail'; // Default
      let wardrobeListRoute = '/tabs/wardrobe/upper-garments'; // Default
      
      if (itemType === 'bottoms' || itemType === 'bottom') {
        detailRoute = '/tabs/wardrobe/bottom-detail';
        wardrobeListRoute = '/tabs/wardrobe/bottoms';
      } else if (itemType === 'shoes' || itemType === 'shoe') {
        detailRoute = '/tabs/wardrobe/shoe-detail';
        wardrobeListRoute = '/tabs/wardrobe/shoes';
      } else if (itemType === 'accessories' || itemType === 'accessory') {
        detailRoute = '/tabs/wardrobe/accessory-detail';
        wardrobeListRoute = '/tabs/wardrobe/accessories';
      } else {
        // Default to upper-garment-detail
        detailRoute = '/tabs/wardrobe/upper-garment-detail';
        wardrobeListRoute = '/tabs/wardrobe/upper-garments';
      }
      
      // Replace the AI cleanup page in history with the wardrobe list route
      // This ensures the back button from detail page goes to wardrobe list, not AI cleanup
      this.location.replaceState(wardrobeListRoute);
      
      this.router.navigate([detailRoute], {
        state: { item: this.item },
      });
    } else {
      this.location.back();
    }
  }

  private async showErrorAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
        },
        {
          text: 'Retry',
          handler: () => {
            // Retry the processing
            if (this.hasGeneratedImage) {
              // If we already have a generated image, this is a regeneration
              this.startRegeneration();
            } else {
              // Otherwise, it's the initial processing
              this.startProcessing();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
