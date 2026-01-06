import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonSpinner,
    IconComponent,
    CommonModule,
    FormsModule,
  ],
})
export class OnboardingPage implements OnInit {
  isLoading = true;
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Check if user is logged in
    // Small delay to ensure auth service is fully initialized
    setTimeout(() => {
      if (this.authService.isLoggedIn()) {
        // User is logged in, redirect to wardrobe
        const userRole = this.authService.userRole();
        if (userRole === 'admin') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/tabs/wardrobe');
        }
      } else {
        // User is not logged in, show onboarding
        this.isLoading = false;
      }
    }, 500);
  }

  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
