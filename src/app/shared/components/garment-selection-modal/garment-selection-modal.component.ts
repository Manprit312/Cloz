import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
  ModalController,
  IonSpinner,
} from '@ionic/angular/standalone';

export type GarmentCategory = 'upper-garments' | 'bottoms' | 'shoes' | 'accessories';

export interface GarmentItem {
  id: string;
  imageUrl: string;
  imageUrls?: string[];
  subtype: string;
  color: string;
  climateFit: string[];
  brand?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-garment-selection-modal',
  templateUrl: './garment-selection-modal.component.html',
  styleUrls: ['./garment-selection-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonThumbnail,
    IonSpinner,
  ],
})
export class GarmentSelectionModalComponent implements OnInit, OnChanges {
  @Input() category: GarmentCategory = 'upper-garments';
  @Input() garments: GarmentItem[] = [];
  @Input() isLoading: boolean = false;

  constructor(
    private modalController: ModalController,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    // Watch for changes to garments and isLoading inputs
    if (changes['garments'] || changes['isLoading']) {
      this.cdr.detectChanges();
    }
  }

  // Public method to update garments and loading state
  updateGarments(garments: GarmentItem[], isLoading: boolean = false): void {
    this.garments = garments;
    this.isLoading = isLoading;
    this.cdr.detectChanges();
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onGarmentSelect(garment: GarmentItem) {
    this.modalController.dismiss(garment, 'confirm');
  }

  getModalTitle(): string {
    const titles: Record<GarmentCategory, string> = {
      'upper-garments': 'Select upper garment',
      'bottoms': 'Select bottom',
      'shoes': 'Select shoes',
      'accessories': 'Select accessory',
    };
    return titles[this.category] || 'Select item';
  }

  getCurrentImage(garment: GarmentItem): string {
    if (garment.imageUrls && garment.imageUrls.length > 0) {
      return garment.imageUrls[0];
    }
    return garment.imageUrl;
  }

  getLoadingText(): string {
    const texts: Record<GarmentCategory, string> = {
      'upper-garments': 'Loading upper garments...',
      'bottoms': 'Loading bottoms...',
      'shoes': 'Loading shoes...',
      'accessories': 'Loading accessories...',
    };
    return texts[this.category] || 'Loading garments...';
  }
}














