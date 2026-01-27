
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonToast,
  ModalController,
} from '@ionic/angular/standalone';
import { Keyboard } from '@capacitor/keyboard';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-password-edit-modal',
  templateUrl: './password-edit-modal.component.html',
  styleUrls: ['./password-edit-modal.component.scss'],
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
    IonToast,

    ButtonComponent,
  ],
})
export class PasswordEditModalComponent implements OnInit {
  @Input() currentEmail: string = '';
  @Input() onError?: (errorMessage: string) => void;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  isToastOpen = false;
  toastMessage = '';
  toastDuration = 2000;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  dismissKeyboard(): void {
    Keyboard.hide();
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  onToastDidDismiss(): void {
    this.isToastOpen = false;
  }

  async save() {
    // Dismiss keyboard
    Keyboard.hide();
    
    // Validate passwords
    if (!this.newPassword || this.newPassword.length < 6) {
      if (this.onError) {
        this.onError('Password must be at least 6 characters');
      }
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      if (this.onError) {
        this.onError('Passwords do not match');
      }
      return;
    }

    // In a real app, verify current password and update
    // For demo, just dismiss with success
    this.showToast('Password updated successfully');

    this.modalController.dismiss({ newPassword: this.newPassword }, 'confirm');
  }
}

