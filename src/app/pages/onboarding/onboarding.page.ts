import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
 

  IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    IonContent,

  

    IonButton,
    IconComponent,
    CommonModule,
    FormsModule,
  ],
})
export class OnboardingPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
