import { Component, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SubtypeSelectionModalComponent } from '../../../../shared/components/subtype-selection-modal/subtype-selection-modal.component';
import { ColorSelectionModalComponent } from '../../../../shared/components/color-selection-modal/color-selection-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { ProfileService } from '../../../../core/services/profile.service';
import { WardrobeService } from '../../../../core/services/wardrobe.service';

export interface AccessoryData {
  id?: string;
  imageUrl?: string;
  subtype?: string;
  color?: string;
  climateFit?: string[];
  brand?: string;
}

@Component({
  selector: 'app-add-accessory',
  templateUrl: './add-accessory.page.html',
  styleUrls: ['./add-accessory.page.scss'],
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
  ],
})
export class AddAccessoryPage implements OnInit {
  imageUrl: string = '';
  originalImageUrl: string = ''; // Store original image URL to detect changes
  subtype: string = '';
  color: string = '';
  climateFit: string[] = [];
  brand: string = '';
  showErrorMessage = false;
  errorMessageText = '';
  isEditMode = false;
  itemId: string = '';
  isModalOpen = false; // Track if any modal is open for backdrop visibility
  isSubmitting = false; // Prevent double submission

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
    private wardrobeService: WardrobeService
  ) {}

  ngOnInit() {
    // Check if we have data passed via navigation state
    const state = history.state;
    if (state && state.garmentData) {
      const data: AccessoryData = state.garmentData;
      console.log('AddAccessoryPage - Setting edit mode with data:', data);
      this.isEditMode = true;
      this.itemId = data.id || '';
      console.log('AddAccessoryPage - itemId set to:', this.itemId, 'type:', typeof this.itemId, 'truthy:', !!this.itemId);
      this.imageUrl = data.imageUrl || '';
      this.originalImageUrl = data.imageUrl || ''; // Store original for comparison
      this.subtype = data.subtype || '';
      this.color = data.color || '';
      this.climateFit = data.climateFit || [];
      this.brand = data.brand || '';
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
        category: 'accessories',
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
      type: 'accessories',
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
      // Include image if it's changed, is base64 (new upload), or if adding new item
      wardrobeItemData.image = this.imageUrl;
      console.log('Including image in update (changed or new upload)');
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
          console.log('✅ Accessory updated successfully:', response);
          this.isSubmitting = false;
          this.location.back();
        },
        error: (err) => {
          console.error('❌ Error updating accessory:', err);
          this.isSubmitting = false;
          this.showErrorMessage = true;
          this.errorMessageText = err.error?.message || 'Failed to update accessory. Please try again.';
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      });
      return; // Exit early to prevent adding new garment
    }
    
    // Add new garment (not in edit mode)
    console.log('ADD MODE: Adding new accessory');
    console.log('ADD MODE: isEditMode:', this.isEditMode, ', itemId:', this.itemId);
    this.wardrobeService.addItem(wardrobeItemData).subscribe({
      next: (response) => {
        console.log('✅ Accessory added:', response);
        this.isSubmitting = false;
        this.location.back();
      },
      error: (err) => {
        console.error('❌ Error saving accessory:', err);
        this.isSubmitting = false;
        this.showErrorMessage = true;
        this.errorMessageText = err.error?.message || 'Failed to save accessory. Please try again.';
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

  onImageSelected(event: Event) {
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

      // Create a FileReader to read the file
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imageUrl = e.target.result as string; // This will be base64, different from originalImageUrl
        }
      };
      
      reader.onerror = () => {
        this.showErrorMessage = true;
        this.errorMessageText = 'Error reading file';
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
      };
      
      reader.readAsDataURL(file);
    }
  }
}

