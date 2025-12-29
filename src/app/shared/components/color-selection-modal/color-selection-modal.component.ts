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


  IonList,
  ModalController,
} from '@ionic/angular/standalone';


export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

@Component({
  selector: 'app-color-selection-modal',
  templateUrl: './color-selection-modal.component.html',
  styleUrls: ['./color-selection-modal.component.scss'],
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


    IonList,
  
  ],
})
export class ColorSelectionModalComponent implements OnInit {
  @Input() currentColor: string = '';

  selectedColor: string = '';

  colors: ColorOption[] = [
    { value: 'Black', label: 'Black', hex: '#000000' },
    { value: 'Blue', label: 'Blue', hex: '#1860FA' },
    { value: 'Brown', label: 'Brown', hex: '#8B4513' },
    { value: 'Green', label: 'Green', hex: '#4CAF50' },
    { value: 'Grey', label: 'Grey', hex: '#808080' },
    { value: 'Orange', label: 'Orange', hex: '#FF9800' },
    { value: 'Pink', label: 'Pink', hex: '#E91E63' },
    { value: 'Print', label: 'Print', hex: 'print' }, // Special case for print pattern
    { value: 'Purple', label: 'Purple', hex: '#9C27B0' },
    { value: 'Red', label: 'Red', hex: '#F44336' },
    { value: 'Teal', label: 'Teal', hex: '#009688' },
    { value: 'White', label: 'White', hex: '#FFFFFF' },
    { value: 'Yellow', label: 'Yellow', hex: '#FFEB3B' },
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.selectedColor = this.currentColor;
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onColorChange(value: string) {
    this.selectedColor = value;
    // Auto-dismiss on selection
    this.modalController.dismiss(value, 'confirm');
  }

  getColorHex(colorValue: string): string {
    const color = this.colors.find(c => c.value === colorValue);
    return color ? color.hex : '#000000';
  }
}

