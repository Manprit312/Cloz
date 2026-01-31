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
import { AuthService, UserService, ProfileService } from '@app-core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Preferences } from '@capacitor/preferences';

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

  dismissKeyboard(): void {
    Keyboard.hide();
  }

  async verify(): Promise<void> {
    // Dismiss keyboard
    Keyboard.hide();
    
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
        next: async (response) => {
          // Clear session storage
          sessionStorage.removeItem('mfaSessionId');
          sessionStorage.removeItem('signupPassword');
          sessionStorage.removeItem('loginPassword');

          const accessToken = response?.['accessToken'] || response?.['token'];
          const sessionId = response?.['sessionId'] || response?.['session'];
          const expiresIn = response?.['expiresIn'] || 300;

          if (accessToken) {
            await this.authService.setAccessToken(accessToken, expiresIn);
          }
          if (sessionId) {
            await this.authService.setSessionId(sessionId);
          }

          // Get user data from GET /user/profile and use for both currentUser and userProfile
          this.userService.getProfile().subscribe({
            next: (profileData) => {
              const roleRaw =
                profileData.role ?? profileData['userRole'] ?? 'user';
              const role: 'admin' | 'user' =
                String(roleRaw).toLowerCase() === 'admin' ? 'admin' : 'user';
              const user = {
                username:
                  profileData.username ?? this.email.split('@')[0] ?? 'user',
                email: profileData.email ?? this.email,
                role,
                ...(profileData.name && { name: profileData.name }),
                ...(profileData.gender && { gender: profileData.gender as 'Male' | 'Female' }),
              };
              this.authService.setUser(user);
              this.profileService.setProfileFromApi(profileData);

              const isSignup = sessionStorage.getItem('isSignup') === 'true';
              sessionStorage.setItem('showLoginSuccess', 'true');
              sessionStorage.setItem('isSignup', isSignup ? 'true' : 'false');

              const redirectUrl =
                user.role === 'admin' ? '/admin' : '/tabs/wardrobe';
              this.router.navigateByUrl(redirectUrl);
            },
            error: (err) => {
              console.error('VerificationPage - getProfile error:', err);
              // Fallback: build user from verify response
              const username =
                response?.['username'] ||
                response?.['user']?.['username'] ||
                this.email.split('@')[0] ||
                'user';
              const email =
                response?.['email'] ||
                response?.['user']?.['email'] ||
                this.email;
              const roleFromResponse =
                response?.['role'] || response?.['user']?.['role'] || 'user';
              const role: 'admin' | 'user' =
                roleFromResponse === 'admin' ? 'admin' : 'user';
              const user = {
                username,
                email,
                role,
                ...(response?.['name'] && { name: response['name'] }),
                ...(response?.['gender'] && { gender: response['gender'] as 'Male' | 'Female' }),
              };
              this.authService.setUser(user);
              this.profileService.syncFromAuthService();

              const isSignup = sessionStorage.getItem('isSignup') === 'true';
              sessionStorage.setItem('showLoginSuccess', 'true');
              sessionStorage.setItem('isSignup', isSignup ? 'true' : 'false');

              const redirectUrl =
                user.role === 'admin' ? '/admin' : '/tabs/wardrobe';
              this.router.navigateByUrl(redirectUrl);
            },
          });
        },
        error: (err) => {
          console.error('MFA verification error:', err);
          this.error =
            err.error?.message || 'Verification failed. Please try again.';
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

