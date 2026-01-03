import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackdrop,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonToggle,
  IonList,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ProfileService, AuthService } from '@app-core';
import { Gender } from '@models/user.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { NameEditModalComponent } from '../../../shared/components/name-edit-modal/name-edit-modal.component';
import { PasswordEditModalComponent } from '../../../shared/components/password-edit-modal/password-edit-modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonBackdrop,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IconComponent,
    CommonModule,
    FormsModule,
    ButtonComponent,
  ],
})
export class ProfilePage implements OnInit {
  profile = computed(() => this.profileService.profile());
  darkMode = computed(() => this.profileService.darkMode());
  showErrorMessage = false;
  errorMessageText = '';
  isModalOpen = false; // Track if any modal is open for backdrop visibility

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    // Sync profile from currentUser in localStorage on page load
    this.profileService.syncFromAuthService();
  }

  async editName(): Promise<void> {
    this.isModalOpen = true;
    const modal = await this.modalController.create({
      component: NameEditModalComponent,
      componentProps: {
        currentName: this.profile().name,
      },
      breakpoints: [0, 0.33],
      initialBreakpoint: 0.33,
      backdropBreakpoint: 0.33,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    this.isModalOpen = false;

    if (role === 'confirm' && data) {
      this.profileService.updateName(data);
    }
  }

  editEmail(): void {
    // Navigate directly to change email page
    this.router.navigateByUrl('/change-email');
  }

  async editGender(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Select gender',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (selectedGender: string) => {
            if (selectedGender) {
              this.profileService.updateGender(selectedGender as Gender);
            }
          },
        },
      ],
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
    });

    await alert.present();
  }

  async changePassword(): Promise<void> {
    this.isModalOpen = true;
    const modal = await this.modalController.create({
      component: PasswordEditModalComponent,
      componentProps: {
        onError: (errorMessage: string) => {
          // Show error message at top of screen without closing modal
          this.showErrorMessage = true;
          this.errorMessageText = errorMessage;
          
          // Hide message after 5 seconds
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 5000);
        }
      },
      breakpoints: [0.4, 0.46, 0.8, 1],
      initialBreakpoint: 0.52,
      backdropDismiss: true,
      handle: true,
    });
    
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    this.isModalOpen = false;

    if (role === 'confirm' && data) {
      // Password update would be handled here in a real app
      console.log('Password updated');
    }
  }

  toggleDarkMode(): void {
    this.profileService.toggleDarkMode();
  }

  getMaskedPassword(): string {
    return '**********';
  }

  async logout(): Promise<void> {
    // Call auth service logout which will call the API and clear all data
    await this.authService.logout();
  }
}
