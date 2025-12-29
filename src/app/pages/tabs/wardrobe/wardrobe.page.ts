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
  IonList,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { WardrobeService } from '../../../core/services/wardrobe.service';
import { inject } from '@angular/core';
import { forkJoin } from 'rxjs';

interface WardrobeCategory {
  name: string;
  count: number;
  route: string;
  type: string; // API type identifier
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
    IonList,
    IconComponent,
    CommonModule,
    FormsModule,
  ],
})
export class WardrobePage implements OnInit {
  showSuccessMessage = false;
  successMessageText = 'Successfully logged in';
  isLoading = false;
  categories: WardrobeCategory[] = [
    { name: 'Upper garments', count: 0, route: '/tabs/wardrobe/upper-garments', type: 'upper_garments' },
    { name: 'Bottoms', count: 0, route: '/tabs/wardrobe/bottoms', type: 'bottoms' },
    { name: 'Shoes', count: 0, route: '/tabs/wardrobe/shoes', type: 'shoes' },
    { name: 'Accessories', count: 0, route: '/tabs/wardrobe/accessories', type: 'accessories' },
  ];

  private router = inject(Router);
  private wardrobeService = inject(WardrobeService);

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

    // Load category counts
    this.loadCategoryCounts();
  }

  /**
   * Reload category counts when page becomes visible (e.g., after adding/updating items)
   */
  ionViewWillEnter(): void {
    this.loadCategoryCounts();
  }

  /**
   * Load counts for all wardrobe categories
   */
  loadCategoryCounts(): void {
    this.isLoading = true;

    // Load all category counts in parallel using dedicated service methods
    forkJoin({
      upper_garments: this.wardrobeService.getUpperGarments(),
      bottoms: this.wardrobeService.getBottoms(),
      shoes: this.wardrobeService.getShoes(),
      accessories: this.wardrobeService.getAccessories(),
    }).subscribe({
      next: (results) => {
        console.log('WardrobePage - Loaded category results:', results);
        // Update counts for each category
        this.categories.forEach((category) => {
          const items = results[category.type as keyof typeof results];
          console.log(`WardrobePage - Category: ${category.name}, Type: ${category.type}, Items:`, items);
          if (Array.isArray(items)) {
            category.count = items.length;
            console.log(`WardrobePage - ${category.name} count set to:`, category.count);
          } else {
            console.warn(`WardrobePage - ${category.name} items is not an array:`, items);
            category.count = 0;
          }
        });
        console.log('WardrobePage - Final categories:', this.categories);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading category counts:', err);
        // Keep default counts (0) on error
        this.isLoading = false;
      },
    });
  }

  goToCategory(route: string): void {
    this.router.navigate([route]);
  }
}
