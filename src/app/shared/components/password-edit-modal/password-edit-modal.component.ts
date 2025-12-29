
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

  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
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

    ButtonComponent,
  ],
})
export class PasswordEditModalComponent implements OnInit {
  @Input() currentEmail: string = '';
  @Input() onError?: (errorMessage: string) => void;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  async save() {
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
    const toast = await this.toastController.create({
      message: 'Password updated successfully',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();

    this.modalController.dismiss({ newPassword: this.newPassword }, 'confirm');
  }
}

