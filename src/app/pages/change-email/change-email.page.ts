import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,


  IonButton,

  IonButtons,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { ProfileService } from '@app-core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.page.html',
  styleUrls: ['./change-email.page.scss'],
  standalone: true,
  imports: [
    IonButton,
  
  
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    CommonModule,
    FormsModule,
  
    ButtonComponent,
    IconComponent,
  ],
})
export class ChangeEmailPage implements OnInit {
  currentEmail = '';
  newEmail = '';
  showErrorMessage = false;
  errorMessageText = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private location = inject(Location);

  ngOnInit() {
    this.currentEmail = this.profileService.profile().email;
    // Get new email from query params if available
    const newEmailParam = this.route.snapshot.queryParamMap.get('newEmail');
    if (newEmailParam) {
      this.newEmail = decodeURIComponent(newEmailParam);
    }
  }

  async updateEmail(): Promise<void> {
    // Dismiss keyboard
    Keyboard.hide();
    
    this.showErrorMessage = false;
    this.errorMessageText = '';

    if (!this.newEmail || !this.newEmail.trim()) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Please enter a new email address';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    if (!this.isValidEmail(this.newEmail)) {
      this.showErrorMessage = true;
      this.errorMessageText = 'Please enter a valid email address';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    if (this.newEmail.trim() === this.currentEmail) {
      this.showErrorMessage = true;
      this.errorMessageText = 'New email must be different from current email';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);
      return;
    }

    // Navigate to verification page
    this.router.navigateByUrl(
      '/verification?email=' +
        encodeURIComponent(this.newEmail.trim()) +
        '&changeEmail=true'
    );
  }

  goBack(): void {
    this.location.back();
  }

  dismissKeyboard(): void {
    Keyboard.hide();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

