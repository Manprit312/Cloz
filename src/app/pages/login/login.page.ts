import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { AuthService, UserService } from '@app-core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
  ],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.userRole();
      const redirectUrl = role === 'admin' ? '/admin' : '/tabs/wardrobe';
      this.router.navigateByUrl(redirectUrl);
    }
  }

  goBack(): void {
    this.location.back();
  }

  dismissKeyboard(): void {
    Keyboard.hide();
  }

  async login(): Promise<void> {
    // Dismiss keyboard
    Keyboard.hide();
    
    // Prevent multiple simultaneous login attempts
    if (this.isLoading) {
      return;
    }

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      return;
    }

    this.isLoading = true;

    // Call Keycloak login API
    const loginData = {
      email: this.email,
      password: this.password,
    };

    this.userService.loginKeycloak(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Store mfaSessionId and password for MFA verification
        sessionStorage.setItem('mfaSessionId', response.mfaSessionId);
        sessionStorage.setItem('loginPassword', this.password);
        sessionStorage.setItem('isSignup', 'false');
        
        // Navigate to verification page
        this.router.navigateByUrl(
          '/verification?email=' + encodeURIComponent(this.email)
        );
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        
        // Check if error is 400 with "User not found. Please signup first." message
        if (err.status === 400 && 
            err.error?.message === 'User not found. Please signup first.') {
          // Redirect to signup page with email pre-filled
          this.router.navigate(['/signup'], {
            queryParams: { email: this.email }
          });
          return;
        }
        
        // Show error for other cases
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
      },
    });
  }
}
