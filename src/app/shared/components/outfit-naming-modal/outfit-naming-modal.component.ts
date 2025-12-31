import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
  IonList,
} from '@ionic/angular/standalone';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-outfit-naming-modal',
  templateUrl: './outfit-naming-modal.component.html',
  styleUrls: ['./outfit-naming-modal.component.scss'],
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
    IonList,
    IconComponent,
  ],
})
export class OutfitNamingModalComponent implements OnInit {
  @Input() suggestedNames: string[] = [];
  @ViewChild('customNameInput', { read: IonInput }) customNameInput?: IonInput;
  
  selectedName: string = '';
  customName: string = '';
  isCustomName: boolean = false;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Set first suggested name as default if available
    if (this.suggestedNames && this.suggestedNames.length > 0) {
      this.selectedName = this.suggestedNames[0];
    }
  }

  selectName(name: string) {
    this.selectedName = name;
    this.isCustomName = false;
    // Auto-close modal and return selected name
    this.modalController.dismiss(name, 'confirm');
  }

  toggleCustomName() {
    if (!this.isCustomName) {
      this.isCustomName = true;
      this.customName = '';
      // Focus on input after a brief delay to ensure it's rendered
      setTimeout(() => {
        this.customNameInput?.setFocus();
      }, 100);
    }
  }

  onCustomNameBlur() {
    // Auto-submit if custom name has value when input loses focus
    if (this.customName.trim().length > 0) {
      this.assignName();
    }
  }

  onCustomNameEnter() {
    // Auto-submit when user presses Enter
    if (this.customName.trim().length > 0) {
      this.assignName();
    }
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  assignName() {
    const finalName = this.customName.trim();
    if (finalName) {
      this.modalController.dismiss(finalName, 'confirm');
    }
  }
}

