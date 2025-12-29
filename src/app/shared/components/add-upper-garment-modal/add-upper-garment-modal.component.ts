import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  ModalController,
} from '@ionic/angular/standalone';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { SubtypeSelectionModalComponent } from '../subtype-selection-modal/subtype-selection-modal.component';
import { ColorSelectionModalComponent } from '../color-selection-modal/color-selection-modal.component';
import { ClimateFitSelectionModalComponent } from '../climate-fit-selection-modal/climate-fit-selection-modal.component';
import { ProfileService } from '../../../core/services/profile.service';

export interface UpperGarmentData {
  imageUrl?: string;
  subtype?: string;
  color?: string;
  climateFit?: string[];
  brand?: string;
}

@Component({
  selector: 'app-add-upper-garment-modal',
  templateUrl: './add-upper-garment-modal.component.html',
  styleUrls: ['./add-upper-garment-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    ButtonComponent,
    IconComponent,
  ],
})
export class AddUpperGarmentModalComponent implements OnInit {
  @Input() garmentData?: UpperGarmentData;

  imageUrl: string = '';
  subtype: string = '';
  color: string = '';
  climateFit: string[] = [];
  brand: string = '';
  showErrorMessage = false;
  errorMessageText = '';

  constructor(
    private modalController: ModalController,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    if (this.garmentData) {
      this.imageUrl = this.garmentData.imageUrl || '';
      this.subtype = this.garmentData.subtype || '';
      this.color = this.garmentData.color || '';
      this.climateFit = this.garmentData.climateFit || [];
      this.brand = this.garmentData.brand || '';
    }
  }

  close() {
    this.modalController.dismiss(null, 'cancel');
  }

  async openSubtypeSelection() {
    const modal = await this.modalController.create({
      component: SubtypeSelectionModalComponent,
      componentProps: {
        currentSubtype: this.subtype,
        category: 'upper-garments',
        gender: this.profileService.profile().gender,
      },
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6,
      backdropBreakpoint: 0.6,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.subtype = data;
    }
  }

  async openColorSelection() {
    const modal = await this.modalController.create({
      component: ColorSelectionModalComponent,
      componentProps: {
        currentColor: this.color,
      },
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6,
      backdropBreakpoint: 0.6,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.color = data;
    }
  }

  async openClimateFitSelection() {
    const modal = await this.modalController.create({
      component: ClimateFitSelectionModalComponent,
      componentProps: {
        currentSelection: [...this.climateFit],
      },
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6,
      backdropBreakpoint: 0.6,
      handle: true,
      handleBehavior: 'cycle',
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data && Array.isArray(data)) {
      this.climateFit = data;
    }
  }

  get climateFitDisplay(): string {
    return this.climateFit.length > 0 ? this.climateFit.join(', ') : '';
  }

  get isFormValid(): boolean {
    return !!(this.imageUrl && this.subtype && this.color && this.climateFit.length > 0);
  }

  addToWardrobe() {
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

      const data: UpperGarmentData = {
        imageUrl: this.imageUrl,
        subtype: this.subtype,
        color: this.color,
        climateFit: this.climateFit,
        brand: this.brand.trim() || undefined,
      };
      this.modalController.dismiss(data, 'confirm');
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
          this.imageUrl = e.target.result as string;
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

