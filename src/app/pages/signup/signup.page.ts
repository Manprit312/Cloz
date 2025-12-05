import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonButton,
  IonInput,
  IonText,
  IonButtons,
  IonBackButton,
  AlertController,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonItem,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    CommonModule,
    FormsModule,
    IonInput,
    IonText,
  ],
})
export class SignupPage implements OnInit {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  gender = '';
  genderDisplayText = 'Select gender';
  error = '';

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ chevronDownOutline });
  }

  ngOnInit() {}

  async openGenderSelector(): Promise<void> {
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
              this.gender = selectedGender;
              this.genderDisplayText = selectedGender;
            }
          },
        },
      ],
      inputs: [
        {
          type: 'radio',
          label: 'Male',
          value: 'Male',
          checked: this.gender === 'Male',
        },
        {
          type: 'radio',
          label: 'Female',
          value: 'Female',
          checked: this.gender === 'Female',
        },
      ],
    });

    await alert.present();
  }

  async signup(): Promise<void> {
    this.error = '';

    // Validation
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.gender) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    // In a real app, you would call a signup service here
    // For now, navigate to verification page
    // Set flag to indicate this is a signup flow
    sessionStorage.setItem('isSignup', 'true');
    this.router.navigateByUrl(
      '/verification?email=' + encodeURIComponent(this.email)
    );
  }
}

