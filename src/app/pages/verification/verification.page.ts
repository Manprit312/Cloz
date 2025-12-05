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
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserService, ProfileService } from '@app-core';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
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
export class VerificationPage implements OnInit {
  code = '';
  email = '';
  isEmailChange = false;
  pageTitle = 'Verification';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    // Get email from query params
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    // Check if this is an email change flow
    this.isEmailChange =
      this.route.snapshot.queryParamMap.get('changeEmail') === 'true';
    this.pageTitle = this.isEmailChange ? 'Verify email' : 'Verification';
  }

  async verify(): Promise<void> {
    if (!this.code || this.code.length !== 4) {
      return;
    }

    // Handle email change verification
    if (this.isEmailChange) {
      // In a real app, you would verify the code with a backend service
      // For demo, just accept any 4-digit code
      this.profileService.updateEmail(this.email);
      // Navigate back to profile
      this.router.navigateByUrl('/tabs/profile');
      return;
    }

    // Handle login/signup verification
    // In a real app, you would verify the code with a backend service
    // For demo purposes, we'll just accept any 4-digit code and log in
    const username = this.email.split('@')[0] || 'user';
    const password = 'user'; // In real app, this would be handled differently

    this.userService.login(username, password).subscribe({
      next: (user) => {
        this.authService.setUser(user);
        // Set a flag to show success message
        sessionStorage.setItem('showLoginSuccess', 'true');
        this.router.navigateByUrl('/tabs/wardrobe');
      },
      error: () => {
        // If login fails, still navigate (for demo)
        sessionStorage.setItem('showLoginSuccess', 'true');
        this.router.navigateByUrl('/tabs/wardrobe');
      },
    });
  }

  onCodeInput(event: any): void {
    // Only allow numbers and limit to 4 digits
    const value = event.target.value.replace(/\D/g, '').slice(0, 4);
    this.code = value;
    event.target.value = value;

    // Auto-submit when 4 digits are entered
    if (value.length === 4) {
      this.verify();
    }
  }
}

