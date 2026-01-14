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
  ActionSheetController,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

import { SubtypeSelectionModalComponent } from '../../../../shared/components/subtype-selection-modal/subtype-selection-modal.component';
import { ColorSelectionModalComponent } from '../../../../shared/components/color-selection-modal/color-selection-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { ProfileService } from '../../../../core/services/profile.service';
import { WardrobeService } from '../../../../core/services/wardrobe.service';
import { ImageCompressionService } from '../../../../core/services/image-compression.service';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { camera, images, close } from 'ionicons/icons';

export interface BottomData {
  id?: string;
  imageUrl?: string;
  subtype?: string;
  color?: string;
  climateFit?: string[];
  brand?: string;
}

@Component({
  selector: 'app-add-bottom',
  templateUrl: './add-bottom.page.html',
  styleUrls: ['./add-bottom.page.scss'],
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
export class AddBottomPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  
  imageUrl: string = '';
  originalImageUrl: string = ''; // Store original image URL to detect changes
  imageFile: File | null = null; // Store original file for upload
  subtype: string = '';
  color: string = '';
  climateFit: string[] = [];
  brand: string = '';
  showErrorMessage = false;
  errorMessageText = '';
  isModalOpen = false; // Track if any modal is open for backdrop visibility
  isSubmitting = false; // Track submission state
  isEditMode = false;
  itemId: string = '';
  isCompressing = false; // Track image compression state
  compressionSuccess = false; // Track compression success
  
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
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private profileService: ProfileService,
    private wardrobeService: WardrobeService,
    private imageCompressionService: ImageCompressionService
  ) {
    // Register icons for action sheet
    addIcons({ camera, images, close });
  }

  ngOnInit() {
    // Check if we have data passed via navigation state
    const state = history.state;
    if (state && state.garmentData) {
      const data: BottomData = state.garmentData;
      console.log('AddBottomPage - Setting edit mode with data:', data);
      this.isEditMode = true;
      this.itemId = data.id || '';
      console.log('AddBottomPage - itemId set to:', this.itemId, 'type:', typeof this.itemId, 'truthy:', !!this.itemId);
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
    // With KeyboardResize.Body, iOS handles most of the work
    // We just need minimal assistance for smooth scrolling
    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      this.keyboardHeight = info.keyboardHeight || 300;
    });
    this.keyboardListeners.push(showListener);

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = 300;
    });
    this.keyboardListeners.push(hideListener);
  }

  private async resetScrollPosition() {
    // Not needed with KeyboardResize.Body - iOS handles it
  }

  private async scrollToActiveInput() {
    // Not needed with KeyboardResize.Body - iOS handles it
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
        category: 'bottoms',
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

  dismissKeyboard() {
    Keyboard.hide();
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
      type: 'bottoms',
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
          console.log('✅ Bottom updated successfully:', response);
          this.isSubmitting = false;
          this.location.back();
        },
        error: (err) => {
          console.error('❌ Error updating bottom:', err);
          this.isSubmitting = false;
          this.showErrorMessage = true;
          this.errorMessageText = err.error?.message || 'Failed to update bottom. Please try again.';
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      });
      return; // Exit early to prevent adding new garment
    }
    
    // Add new garment (not in edit mode)
    console.log('ADD MODE: Adding new bottom');
    console.log('ADD MODE: isEditMode:', this.isEditMode, ', itemId:', this.itemId);
    this.wardrobeService.addItem(wardrobeItemData).subscribe({
      next: (response) => {
        console.log('✅ Bottom added:', response);
        this.isSubmitting = false;
        this.location.back();
      },
      error: (err) => {
        console.error('❌ Error saving bottom:', err);
        this.isSubmitting = false;
        this.showErrorMessage = true;
        this.errorMessageText = err.error?.message || 'Failed to save bottom. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      },
    });
  }

  async selectImageSource() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'images',
          handler: () => {
            this.chooseFromGallery();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        await this.processImage(image.webPath);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      if ((error as any).message !== 'User cancelled photos app') {
        this.showErrorMessage = true;
        this.errorMessageText = 'Error accessing camera. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      }
    }
  }

  async chooseFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      if (image.webPath) {
        await this.processImage(image.webPath);
      }
    } catch (error) {
      console.error('Error choosing from gallery:', error);
      if ((error as any).message !== 'User cancelled photos app') {
        this.showErrorMessage = true;
        this.errorMessageText = 'Error accessing gallery. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      }
    }
  }

  async processImage(webPath: string) {
    this.isCompressing = true;
    this.showErrorMessage = false;
    this.errorMessageText = '';
    this.compressionSuccess = false;

    try {
      const response = await fetch(webPath);
      const blob = await response.blob();
      const file = new File([blob], 'garment-image.jpg', { type: 'image/jpeg' });
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`Original image size: ${originalSizeMB} MB`);

      const compressedFile = await this.imageCompressionService.compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.7,
        maxSizeMB: 1
      });

      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      const reductionPercent = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      console.log(`Compressed image size: ${compressedSizeMB} MB (${reductionPercent}% reduction)`);

      this.imageFile = compressedFile;
      const base64 = await this.imageCompressionService.fileToBase64(compressedFile);
      this.imageUrl = base64;
      
      this.compressionSuccess = true;
      setTimeout(() => {
        this.compressionSuccess = false;
      }, 3000);
    } catch (error) {
      console.error('Error processing image:', error);
      this.showErrorMessage = true;
      this.errorMessageText = 'Error processing image. Please try again.';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
    } finally {
      this.isCompressing = false;
    }
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
    this.compressionSuccess = false;

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

      // Show original file size
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`Original image size: ${originalSizeMB} MB`);

      // Set compressing state
      this.isCompressing = true;

      try {
        // Compress the image before storing - more aggressive compression for smaller file size
        const compressedFile = await this.imageCompressionService.compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.7,
          maxSizeMB: 1
        });

        // Show compressed file size
        const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
        const reductionPercent = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
        console.log(`Compressed image size: ${compressedSizeMB} MB (${reductionPercent}% reduction)`);

        // Store the compressed file for upload
        this.imageFile = compressedFile;

        // Convert compressed file to base64 for preview
        const base64 = await this.imageCompressionService.fileToBase64(compressedFile);
        this.imageUrl = base64;
        
        // Show success message
        this.compressionSuccess = true;
        setTimeout(() => {
          this.compressionSuccess = false;
        }, 3000);
      } catch (error) {
        console.error('Error compressing image:', error);
        this.showErrorMessage = true;
        this.errorMessageText = 'Error processing image. Please try again.';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      } finally {
        this.isCompressing = false;
      }
    }
  }
}

