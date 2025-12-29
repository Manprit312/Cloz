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
  IonCheckbox,
  IonList,
  ModalController,
} from '@ionic/angular/standalone';

export interface ClimateFitOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-climate-fit-selection-modal',
  templateUrl: './climate-fit-selection-modal.component.html',
  styleUrls: ['./climate-fit-selection-modal.component.scss'],
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
    IonCheckbox,
    IonList,
  ],
})
export class ClimateFitSelectionModalComponent implements OnInit {
  @Input() currentSelection: string[] = [];

  selectedOptions: string[] = [];

  climateOptions: ClimateFitOption[] = [
    { value: 'Cold', label: 'Cold' },
    { value: 'Mild', label: 'Mild' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Hot', label: 'Hot' },
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.selectedOptions = [...this.currentSelection];
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalController.dismiss(this.selectedOptions, 'confirm');
  }

  toggleOption(value: string) {
    const index = this.selectedOptions.indexOf(value);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(value);
    }
  }

  isSelected(value: string): boolean {
    return this.selectedOptions.includes(value);
  }
}

