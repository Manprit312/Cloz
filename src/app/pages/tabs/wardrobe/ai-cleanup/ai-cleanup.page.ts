import { Component, OnInit } from '@angular/core';
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
  
  get displayImage(): string {
    // Show generated image if available, otherwise show original
    if (this.hasGeneratedImage && this.generatedImageUrl) {
      return this.generatedImageUrl;
    }
    return this.item?.imageUrl || '';
  }

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
      this.startProcessing();
    } else {
      // If no item data, go back
      this.location.back();
    }
  }

  startProcessing() {
    if (!this.item) return;
    
    // Start processing immediately
    this.isProcessing = true;
    this.hasGeneratedImage = false;
    
    // Simulate AI processing - in real app, this would be an API call
    setTimeout(() => {
      this.isProcessing = false;
      this.hasGeneratedImage = true;
      
      // In real app, this would be the generated image URL from API
      // For demo, we'll use the same image with a timestamp to simulate new image
      // Use original image URL if available, otherwise use current imageUrl
      const baseImageUrl = this.item!.originalImageUrl || this.item!.imageUrl;
      this.generatedImageUrl = baseImageUrl + '?generated=' + Date.now();
    }, 3000); // 3 seconds for demo
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
    
    // Store the original image URL (the one that was passed to this page)
    const originalImageUrl = this.item.originalImageUrl || this.item.imageUrl;
    
    // Create updated item with multiple images for carousel
    // Add the generated image to the existing array of images
    let updatedImages: string[] = [];
    
    if (this.item.imageUrls && this.item.imageUrls.length > 0) {
      // If imageUrls already exists, add the generated image if not present
      updatedImages = [...this.item.imageUrls];
      
      // Add generated image if not present
      if (!updatedImages.includes(generatedImageUrl)) {
        updatedImages.push(generatedImageUrl);
      }
    } else {
      // If no imageUrls, create array with original and generated images
      updatedImages = [originalImageUrl, generatedImageUrl];
    }
    
    const updatedItem: UpperGarmentItem = {
      ...this.item,
      imageUrls: updatedImages,
      imageUrl: generatedImageUrl, // Set generated image as primary
      originalImageUrl: originalImageUrl, // Preserve original for reference
    };
    
    console.log('Setting generated image as garment image:', this.item.id);
    console.log('Updated item:', updatedItem);
    console.log('Updated images array:', updatedImages);
    console.log('Has multiple images:', updatedImages.length > 1);
    
    // Set sessionStorage flag as fallback in case state is lost
    sessionStorage.setItem('showImageUpdateSuccess', 'true');
    sessionStorage.setItem('fromAICleanup', 'true'); // Mark that we're coming from AI cleanup
    
    // Navigate to detail page with updated image (banner will show on detail page)
    this.router.navigate(['/tabs/wardrobe/upper-garment-detail'], {
      state: { 
        item: updatedItem,
        showSuccess: true,
        fromAICleanup: true // Explicitly mark navigation from AI cleanup
      },
    });
  }

  async onRegenerate(): Promise<void> {
    if (!this.canRegenerate) {
      return;
    }

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

    const { data, role } = await modal.onWillDismiss();

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
    if (!this.item) return;
    
    // Start processing for regeneration
    this.isProcessing = true;
    
    // Simulate AI processing - in real app, this would be an API call
    setTimeout(() => {
      this.isProcessing = false;
      this.hasGeneratedImage = true;
      
      // After processing completes, replace the current generated image with regenerated one
      // In real app, this would be the regenerated image URL from API
      // For now, we'll use a placeholder or the same URL with a timestamp to simulate new image
      const originalImageUrl = this.item!.originalImageUrl || this.item!.imageUrl;
      const regeneratedImageUrl = originalImageUrl + '?regenerated=' + Date.now();
      
      // Update the generated image URL
      this.generatedImageUrl = regeneratedImageUrl;
    }, 3000); // 3 seconds for demo
  }

  get canRegenerate(): boolean {
    return this.regenerateCount < this.maxRegenerations;
  }

  get regenerateText(): string {
    return `Regenerate (${this.regenerateCount}/${this.maxRegenerations})`;
  }

  async onCancel(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancel AI cleanup?',
      message: "The generated image will be discarded, and today's regeneration attempts will not refill until tomorrow.",
      cssClass: 'cancel-cleanup-alert',
      buttons: [
        {
          text: 'Stay here',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Discard',
          cssClass: 'alert-button-confirm',
          handler: () => {
            // Navigate back to detail page
            if (this.item) {
              this.router.navigate(['/tabs/wardrobe/upper-garment-detail'], {
                state: { item: this.item },
              });
            } else {
              this.location.back();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
