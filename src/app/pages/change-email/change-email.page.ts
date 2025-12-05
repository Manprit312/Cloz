import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '@app-core';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.page.html',
  styleUrls: ['./change-email.page.scss'],
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
    CommonModule,
    FormsModule,
    IonInput,
  ],
})
export class ChangeEmailPage implements OnInit {
  currentEmail = '';
  newEmail = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.currentEmail = this.profileService.profile().email;
    // Get new email from query params if available
    const newEmailParam = this.route.snapshot.queryParamMap.get('newEmail');
    if (newEmailParam) {
      this.newEmail = decodeURIComponent(newEmailParam);
    }
  }

  async updateEmail(): Promise<void> {
    this.error = '';

    if (!this.newEmail || !this.newEmail.trim()) {
      this.error = 'Please enter a new email address';
      return;
    }

    if (!this.isValidEmail(this.newEmail)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    if (this.newEmail.trim() === this.currentEmail) {
      this.error = 'New email must be different from current email';
      return;
    }

    // Navigate to verification page
    this.router.navigateByUrl(
      '/verify-email?email=' +
        encodeURIComponent(this.newEmail.trim()) +
        '&changeEmail=true'
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

