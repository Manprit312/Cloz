import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { shirtOutline } from 'ionicons/icons';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class OnboardingPage implements OnInit {
  constructor(private router: Router) {
    addIcons({ shirtOutline });
  }

  ngOnInit() {}

  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
