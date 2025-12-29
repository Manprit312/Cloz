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
import { AuthService, UserService, ProfileService } from '@app-core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
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
    IconComponent,
    ButtonComponent,
  ],
})
export class VerificationPage implements OnInit {
  code = '';
  email = '';
  isEmailChange = false;
  pageTitle = 'Verification';
  error = '';
  private mfaSessionId: string | null = null;
  private password: string | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private location = inject(Location);

  ngOnInit() {
    // Get email from query params
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    // Check if this is an email change flow
    this.isEmailChange =
      this.route.snapshot.queryParamMap.get('changeEmail') === 'true';
    this.pageTitle = this.isEmailChange ? 'Verify email' : 'Verification';
    
    // Get mfaSessionId and password from sessionStorage (for both login and signup flows)
    this.mfaSessionId = sessionStorage.getItem('mfaSessionId');
    // Check for both signupPassword and loginPassword
    this.password = sessionStorage.getItem('signupPassword') || sessionStorage.getItem('loginPassword');
  }

  goBack(): void {
    this.location.back();
  }

  async verify(): Promise<void> {
    this.error = '';
    
    if (!this.code || this.code.length !== 6) {
      return;
    }

    // Handle email change verification
    if (this.isEmailChange) {
      // In a real app, you would verify the code with a backend service
      // For demo, just accept any 6-digit code
      this.profileService.updateEmail(this.email);
      // Navigate back to profile
      this.router.navigateByUrl('/tabs/profile');
      return;
    }

    // Handle MFA verification for both login and signup flows
    if (this.mfaSessionId && this.password) {
      const verifyData = {
        mfaSessionId: this.mfaSessionId,
        otpCode: this.code,
        password: this.password,
      };

      this.userService.verifyMfa(verifyData).subscribe({
        next: (response) => {
          // Clear session storage
          sessionStorage.removeItem('mfaSessionId');
          sessionStorage.removeItem('signupPassword');
          sessionStorage.removeItem('loginPassword');
          
          console.log('VerificationPage - verifyMfa response:', response);
          
          // Extract accessToken and expiresIn from response
          const accessToken = response?.['accessToken'] || response?.['token'];
          const expiresIn = response?.['expiresIn'] || 900; // Default to 15 minutes if not provided
          if (accessToken) {
            this.authService.setAccessToken(accessToken, expiresIn);
          }
          
          // Session handling moved to backend
          // The backend sets a session ID cookie after MFA verification
          // The session cookie is automatically sent with all requests (withCredentials: true)
          // The backend manages refresh tokens server-side, linked to the session ID
          // When calling /auth/refresh, the session cookie identifies the session
          // No need to store refreshToken in localStorage - backend handles it via session
          console.log('VerificationPage - MFA verification successful');
          console.log('VerificationPage - Session cookie should be set by backend');
          console.log('VerificationPage - Backend manages refresh tokens server-side via session');
          
          // Extract user data from response or construct from email
          // The API response might contain user data, or we construct it from email
          const username = response?.['username'] || response?.['user']?.['username'] || this.email.split('@')[0] || 'user';
          const email = response?.['email'] || response?.['user']?.['email'] || this.email;
          const name = response?.['name'] || response?.['user']?.['name'];
          const gender = response?.['gender'] || response?.['user']?.['gender'];
          const roleFromResponse = response?.['role'] || response?.['user']?.['role'] || 'user';
          const role: 'admin' | 'user' = roleFromResponse === 'admin' ? 'admin' : 'user';
          
          // Create user object to store in localStorage as currentUser
          const user = {
            username,
            email,
            role,
            ...(name && { name }),
            ...(gender && { gender }),
          };
          
          // Set user in AuthService (this stores it in localStorage as 'currentUser')
          this.authService.setUser(user);
          
          // Sync profile service with the currentUser data
          this.profileService.syncFromAuthService();
          
          // Set a flag to show success message
          const isSignup = sessionStorage.getItem('isSignup') === 'true';
          sessionStorage.setItem('showLoginSuccess', 'true');
          sessionStorage.setItem('isSignup', isSignup ? 'true' : 'false');
          
          // Redirect admin users to admin panel, regular users to wardrobe
          const redirectUrl = user.role === 'admin' ? '/admin' : '/tabs/wardrobe';
          this.router.navigateByUrl(redirectUrl);
        },
        error: (err) => {
          console.error('MFA verification error:', err);
          // Handle error - show error message to user
          // You might want to add a toast or alert here
          this.error = err.error?.message || 'Verification failed. Please try again.';
        },
      });
      return;
    }

    // If no mfaSessionId, show error
    this.error = 'Session expired. Please try logging in again.';
  }

  onCodeInput(event: any): void {
    // Clear any previous errors
    this.error = '';
    
    // Only allow numbers and limit to 6 digits
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    this.code = value;
    event.target.value = value;

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      this.verify();
    }
  }
}

