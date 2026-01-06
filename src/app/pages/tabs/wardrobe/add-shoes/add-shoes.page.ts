import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackdrop,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  AlertController,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SubtypeSelectionModalComponent } from '../../../../shared/components/subtype-selection-modal/subtype-selection-modal.component';
import { ColorSelectionModalComponent } from '../../../../shared/components/color-selection-modal/color-selection-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { ProfileService } from '../../../../core/services/profile.service';
import { WardrobeService } from '../../../../core/services/wardrobe.service';
import { ImageCompressionService } from '../../../../core/services/image-compression.service';
import { Keyboard } from '@capacitor/keyboard';

export interface ShoeData {
  id?: string;
  imageUrl?: string;
  subtype?: string;
  color?: string;
  climateFit?: string[];
  brand?: string;
}

@Component({
  selector: 'app-add-shoes',
  templateUrl: './add-shoes.page.html',
  styleUrls: ['./add-shoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackdrop,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    ButtonComponent,
    IconComponent,
    IonSpinner,
  ],
})
export class AddShoesPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  
  imageUrl: string = '';
  originalImageUrl: string = ''; // Store original image URL to detect changes
  subtype: string = '';
  color: string = '';
  climateFit: string[] = [];
  brand: string = '';
  showErrorMessage = false;
  errorMessageText = '';
  isModalOpen = false; // Track if any modal is open for backdrop visibility
  isEditMode = false;
  itemId: string = '';
  isSubmitting = false; // Prevent double submission
  isCompressing = false; // Track image compression state
  compressionSuccess = false; // Track compression success
  imageFile: File | null = null; // Store compressed file for upload
  
  private keyboardListeners: any[] = [];
  private keyboardHeight: number = 300; // Default keyboard height, will be updated from event

  climateOptions = [
    { value: 'Cold', label: 'Cold' },
    { value: 'Mild', label: 'Mild' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Hot', label: 'Hot' },
  ];

  constructor(
    private location: Location,
    private modalController: ModalController,
    private alertController: AlertController,
    private profileService: ProfileService,
    private wardrobeService: WardrobeService,
    private imageCompressionService: ImageCompressionService
  ) {}

  ngOnInit() {
    // Check if we have data passed via navigation state
    const state = history.state;
    if (state && state.garmentData) {
      const data: ShoeData = state.garmentData;
      console.log('AddShoesPage - Setting edit mode with data:', data);
      this.isEditMode = true;
      this.itemId = data.id || '';
      console.log('AddShoesPage - itemId set to:', this.itemId, 'type:', typeof this.itemId, 'truthy:', !!this.itemId);
      this.imageUrl = data.imageUrl || '';
      this.originalImageUrl = data.imageUrl || ''; // Store original for comparison
      this.subtype = data.subtype || '';
      this.color = data.color || '';
      this.climateFit = data.climateFit || [];
      this.brand = data.brand || '';
    }
  }

  ngAfterViewInit() {
    this.setupKeyboardHandling();
  }

  ngOnDestroy() {
    // Remove keyboard listeners
    this.keyboardListeners.forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      }
    });
    this.keyboardListeners = [];
  }

  private setupKeyboardHandling() {
    // Listen for keyboard show event
    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      // Store the actual keyboard height from the event
      this.keyboardHeight = info.keyboardHeight || 300;
      setTimeout(() => {
        this.scrollToActiveInput();
      }, 300); // Small delay to ensure keyboard is fully shown
    });
    this.keyboardListeners.push(showListener);

    // Listen for keyboard hide event to reset height
    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 300; // Reset to default
    });
    this.keyboardListeners.push(hideListener);

    // Also handle focus events on inputs
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        setTimeout(() => {
          this.scrollToActiveInput();
        }, 300);
      });
    });
  }

  private async scrollToActiveInput() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'INPUT') {
      try {
        const inputElement = activeElement as HTMLElement;
        const inputRect = inputElement.getBoundingClientRect();
        const contentElement = await this.content.getScrollElement();
        
        // Use actual keyboard height from event, or fallback to default
        const viewportHeight = window.innerHeight;
        const inputTop = inputRect.top;
        const inputBottom = inputRect.bottom;
        const visibleAreaBottom = viewportHeight - this.keyboardHeight;
        
        // Add extra padding to ensure input is fully visible above keyboard
        const padding = 40; // Extra padding to ensure input is clearly visible
        
        if (inputBottom > visibleAreaBottom - padding) {
          // Input is hidden or too close to keyboard, scroll to make it visible
          const scrollOffset = inputBottom - (visibleAreaBottom - padding);
          const currentScroll = contentElement.scrollTop;
          await this.content.scrollToPoint(0, currentScroll + scrollOffset, 300);
        } else if (inputTop < 0) {
          // Input is above visible area, scroll it into view
          const scrollOffset = inputTop - padding;
          const currentScroll = contentElement.scrollTop;
          await this.content.scrollToPoint(0, currentScroll + scrollOffset, 300);
        }
      } catch (error) {
        console.error('Error scrolling to input:', error);
      }
    }
  }

  close() {
    this.location.back();
  }

  async openSubtypeSelection() {
    this.isModalOpen = true;
    const modal = await this.modalController.create({
      component: SubtypeSelectionModalComponent,
      componentProps: {
        currentSubtype: this.subtype,
        category: 'shoes',
        gender: this.profileService.profile().gender,
      },
      breakpoints: [0, 0.6, 1],
      initialBreakpoint: 0.6,
      backdropBreakpoint: 0.6,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    this.isModalOpen = false;

    if (data) {
      this.subtype = data;
    }
  }

  async openColorSelection() {
    this.isModalOpen = true;
    const modal = await this.modalController.create({
      component: ColorSelectionModalComponent,
      componentProps: {
        currentColor: this.color,
      },
      breakpoints: [0, 0.6, 1],
      initialBreakpoint: 0.6,
      backdropBreakpoint: 0.6,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    this.isModalOpen = false;

    if (data) {
      this.color = data;
    }
  }

  async openClimateFitSelection() {
    const inputs = this.climateOptions.map(option => ({
      type: 'checkbox' as const,
      label: option.label,
      value: option.value,
      checked: this.climateFit.includes(option.value),
    }));

    const alert = await this.alertController.create({
      header: 'Select climate fit',
      subHeader: 'For which temperatures is it comfortable to wear this garment?',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Do nothing on cancel
          },
        },
        {
          text: 'Confirm',
          handler: (selectedValues: string[]) => {
            this.climateFit = selectedValues || [];
          },
        },
      ],
    });

    await alert.present();
  }

  get climateFitDisplay(): string {
    return this.climateFit.length > 0 ? this.climateFit.join(', ') : '';
  }

  get isFormValid(): boolean {
    return !!(this.imageUrl && this.subtype && this.color && this.climateFit.length > 0);
  }

  addToWardrobe() {
    console.log('addToWardrobe called - isEditMode:', this.isEditMode, 'itemId:', this.itemId);
    // Prevent double submission
    if (this.isSubmitting) {
      console.log('Already submitting, returning early');
      return;
    }

    this.showErrorMessage = false;
    this.errorMessageText = '';

    if (!this.imageUrl) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Please upload an image';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    if (!this.subtype) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Please select a subtype';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    if (!this.color) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Please select a color';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    if (this.climateFit.length === 0) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Please select a climate fit';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    // Prepare data for wardrobe service
    const wardrobeItemData: any = {
      type: 'shoes',
      subtype: this.subtype,
      color: this.color,
      climatefit: this.climateFit.join(','), // Convert array to comma-separated string
      brand: this.brand.trim() || undefined,
    };
    
    // Only include image if it was changed (base64 string indicates new image uploaded)
    // If imageUrl is the same as originalImageUrl, it means image wasn't changed (it's still a URL)
    const imageChanged = this.imageUrl !== this.originalImageUrl;
    // Also include if imageUrl is base64 (starts with data:image) which means it's a new upload
    const isBase64Image = this.imageUrl.startsWith('data:image');
    
    if (imageChanged || isBase64Image || !this.isEditMode) {
      // Use the compressed file if available, otherwise use base64
      // The compressed file is already optimized, so prefer it over base64
      if (this.imageFile) {
        wardrobeItemData.image = this.imageFile;
        console.log('Including compressed image file in upload');
      } else {
        wardrobeItemData.image = this.imageUrl;
        console.log('Including image base64 in update (changed or new upload)');
      }
    } else {
      console.log('Image not changed, skipping image field in update');
    }

    // Set submitting flag
    this.isSubmitting = true;

    // Save or update garment based on edit mode
    console.log('Checking update condition - isEditMode:', this.isEditMode, 'itemId:', this.itemId, 'itemId truthy:', !!this.itemId);
    
    // Update existing garment if in edit mode
    if (this.isEditMode && this.itemId && this.itemId.trim() !== '') {
      console.log('UPDATE MODE: Calling updateItem API with ID:', this.itemId);
      console.log('UPDATE MODE: Data being sent:', wardrobeItemData);
      
      this.wardrobeService.updateItem(this.itemId, wardrobeItemData).subscribe({
        next: (response) => {
          console.log('✅ Shoe updated successfully:', response);
          this.isSubmitting = false;
          this.location.back();
        },
        error: (err) => {
          console.error('❌ Error updating shoe:', err);
          this.isSubmitting = false;
          this.showErrorMessage = true;
          this.errorMessageText = err.error?.message || 'Failed to update shoe. Please try again.';
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      });
      return; // Exit early to prevent adding new garment
    }
    
    // Add new garment (not in edit mode)
    console.log('ADD MODE: Adding new shoe');
    console.log('ADD MODE: isEditMode:', this.isEditMode, ', itemId:', this.itemId);
    this.wardrobeService.addItem(wardrobeItemData).subscribe({
      next: (response) => {
        console.log('✅ Shoe added:', response);
        this.isSubmitting = false;
        this.location.back();
      },
      error: (err) => {
        console.error('❌ Error saving shoe:', err);
        this.isSubmitting = false;
        this.showErrorMessage = true;
        this.errorMessageText = err.error?.message || 'Failed to save shoe. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      },
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async onImageSelected(event: Event) {
    this.showErrorMessage = false;
    this.errorMessageText = '';

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showErrorMessage = true;
        this.errorMessageText = 'Please select an image file';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
        return;
      }

      // Set compressing state
      this.isCompressing = true;
      this.compressionSuccess = false; // Reset success state

      try {
        // Compress the image before storing - more aggressive compression for smaller file size
        const compressedFile = await this.imageCompressionService.compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.7,
          maxSizeMB: 1
        });

        // Store the compressed file for upload
        this.imageFile = compressedFile;

        // Convert compressed file to base64 for preview
        const base64 = await this.imageCompressionService.fileToBase64(compressedFile);
        this.imageUrl = base64;
        
        this.compressionSuccess = true; // Set success state
        console.log(`Original size: ${file.size / 1024} KB, Compressed size: ${compressedFile.size / 1024} KB`);
      } catch (error) {
        console.error('Error compressing image:', error);
        this.showErrorMessage = true;
        this.errorMessageText = 'Error processing image. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      } finally {
        this.isCompressing = false;
        setTimeout(() => this.compressionSuccess = false, 3000); // Hide success after 3s
      }
    }
  }
}

