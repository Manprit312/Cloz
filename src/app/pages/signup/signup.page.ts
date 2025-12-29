import { Component, OnInit, inject } from '@angular/core';
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
    AlertController,
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { IconComponent } from '../../shared/components/icon/icon.component';
import { UserService } from '@app-core';

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

    CommonModule,
    FormsModule,
    IonInput,
    IonText,

    IconComponent,
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

  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) {}

  ngOnInit() {
    // Get email from query params if provided (e.g., when redirected from login)
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.email = emailParam;
    }
  }

  goBack(): void {
    this.location.back();
  }

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

    // Call Keycloak signup API
    const signupData = {
      name: this.name,
      email: this.email,
      password: this.password,
      gender: this.gender.toLowerCase(), // Convert to lowercase as per API requirement
    };

    this.userService.signup(signupData).subscribe({
      next: (response) => {
        // Store mfaSessionId and password for MFA verification
        sessionStorage.setItem('mfaSessionId', response.mfaSessionId);
        sessionStorage.setItem('signupPassword', this.password);
        sessionStorage.setItem('isSignup', 'true');
        
        // Navigate to verification page
        this.router.navigateByUrl(
          '/verification?email=' + encodeURIComponent(this.email)
        );
      },
      error: (err) => {
        console.error('Signup error:', err);
        this.error = err.error?.message || 'Signup failed. Please try again.';
      },
    });
  }
}

