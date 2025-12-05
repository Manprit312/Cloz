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
  IonSelectOption,
  IonInput,
  IonSelect,
  IonText,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserService } from '@app-core';
import { UserRole } from '@models/user.model';

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
    CommonModule,
    FormsModule,
    TranslateModule,
    IonInput,
    IonText,
  ],
})
export class LoginPage implements OnInit {
  username = '';
  password = '';
  error = '';

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/tabs/home');
    }
  }

  async login(): Promise<void> {
    this.error = '';

    this.userService.login(this.username, this.password).subscribe({
      next: (user) => {
        this.authService.setUser(user);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (user.role === 'admin') {
          this.router.navigateByUrl(returnUrl || '/admin');
        } else {
          this.router.navigateByUrl(returnUrl || '/tabs/home');
        }
      },
      error: () => {
        this.error = 'Invalid credentials';
      },
    });
  }
}
