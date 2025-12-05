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
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, checkmarkCircleOutline } from 'ionicons/icons';

interface WardrobeCategory {
  name: string;
  count: number;
  route: string;
}

@Component({
  selector: 'app-wardrobe',
  templateUrl: './wardrobe.page.html',
  styleUrls: ['./wardrobe.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class WardrobePage implements OnInit {
  showSuccessMessage = false;
  successMessageText = 'Successfully logged in';
  categories: WardrobeCategory[] = [
    { name: 'Bottoms', count: 0, route: '/tabs/wardrobe/bottoms' },
    { name: 'Shoes', count: 0, route: '/tabs/wardrobe/shoes' },
    { name: 'Accessories', count: 0, route: '/tabs/wardrobe/accessories' },
  ];

  constructor(private router: Router) {
    addIcons({ chevronForwardOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    // Check if we should show success message
    const showLoginSuccess = sessionStorage.getItem('showLoginSuccess');
    const isSignup = sessionStorage.getItem('isSignup');
    
    if (showLoginSuccess === 'true') {
      this.showSuccessMessage = true;
      this.successMessageText = isSignup === 'true' 
        ? 'Successfully signed up' 
        : 'Successfully logged in';
      
      sessionStorage.removeItem('showLoginSuccess');
      sessionStorage.removeItem('isSignup');

      // Hide message after 5 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
    }
  }

  goToCategory(route: string): void {
    // Navigate to category page (to be implemented)
    console.log('Navigate to:', route);
  }
}
