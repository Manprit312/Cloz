import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  AlertController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { ProfileService } from '@app-core';
import { Gender } from '@models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonIcon,
    IonToggle,
    CommonModule,
    FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  profile = computed(() => this.profileService.profile());
  darkMode = computed(() => this.profileService.darkMode());

  constructor(
    private profileService: ProfileService,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({ chevronForwardOutline });
  }

  ngOnInit() {}

  async editName(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name',
          value: this.profile().name,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.name && data.name.trim()) {
              this.profileService.updateName(data.name.trim());
            }
          },
        },
      ],
    });

    await alert.present();
  }

  editEmail(): void {
    // Navigate directly to change email page
    this.router.navigateByUrl('/change-email');
  }

  async editGender(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Gender',
      inputs: [
        {
          type: 'radio',
          label: 'Male',
          value: 'Male',
          checked: this.profile().gender === 'Male',
        },
        {
          type: 'radio',
          label: 'Female',
          value: 'Female',
          checked: this.profile().gender === 'Female',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (selectedGender: Gender) => {
            if (selectedGender) {
              this.profileService.updateGender(selectedGender);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async changePassword(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current password',
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New password',
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm new password',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: (data) => {
            // Validate passwords
            if (!data.newPassword || data.newPassword.length < 6) {
              // Show error (in real app, use toast or better error handling)
              return false;
            }

            if (data.newPassword !== data.confirmPassword) {
              // Show error
              return false;
            }

            // In a real app, verify current password and update
            // For demo, just accept it
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  toggleDarkMode(): void {
    this.profileService.toggleDarkMode();
  }

  getMaskedPassword(): string {
    return '**********';
  }
}
