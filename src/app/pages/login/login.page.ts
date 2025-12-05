import { Component, inject, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserService } from '@app-core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    TranslateModule,
    IonInput,
    IonText,
  ],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  error = '';

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/tabs/wardrobe');
    }
  }

  async login(): Promise<void> {
    this.error = '';

    // Use email as username for now (in real app, this would be separate)
    // Extract username from email for demo
    const username = this.email.split('@')[0] || this.email;
    
    this.userService.login(username, this.password).subscribe({
      next: (user) => {
        this.authService.setUser(user);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (user.role === 'admin') {
          this.router.navigateByUrl(returnUrl || '/admin');
        } else {
          // For demo: navigate to verification
          // In real app, check if email is verified before navigating
          this.router.navigateByUrl('/verification?email=' + encodeURIComponent(this.email));
        }
      },
      error: () => {
        this.error = 'Invalid credentials';
      },
    });
  }
}
