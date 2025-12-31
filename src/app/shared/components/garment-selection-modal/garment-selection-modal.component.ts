import { Component, Input, OnInit } from '@angular/core';
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
  ],
})
export class GarmentSelectionModalComponent implements OnInit {
  @Input() category: GarmentCategory = 'upper-garments';
  @Input() garments: GarmentItem[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

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
}














