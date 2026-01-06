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
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { WardrobeService } from '../../../core/services/wardrobe.service';
import { inject } from '@angular/core';

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
    SkeletonLoaderComponent,
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
   * Makes requests sequentially with delays to avoid rate limiting (429 errors)
   */
  loadCategoryCounts(): void {
    this.isLoading = true;

    // Create an array of category load functions with their types
    const categoryLoaders = [
      { type: 'upper_garments', loader: () => this.wardrobeService.getUpperGarments() },
      { type: 'bottoms', loader: () => this.wardrobeService.getBottoms() },
      { type: 'shoes', loader: () => this.wardrobeService.getShoes() },
      { type: 'accessories', loader: () => this.wardrobeService.getAccessories() },
    ];

    // Track how many requests have completed
    let completedCount = 0;
    const totalRequests = categoryLoaders.length;

    // Process each category sequentially with 300ms delay between requests
    categoryLoaders.forEach((categoryLoader, index) => {
      const delayTime = index * 300; // 300ms delay between requests to avoid rate limiting
      
      setTimeout(() => {
        categoryLoader.loader().subscribe({
          next: (items) => {
            const category = this.categories.find((cat) => cat.type === categoryLoader.type);
            if (category) {
              if (Array.isArray(items)) {
                category.count = items.length;
                console.log(`WardrobePage - ${category.name} count set to:`, category.count);
              } else {
                console.warn(`WardrobePage - ${category.name} items is not an array:`, items);
                category.count = 0;
              }
            }
            
            completedCount++;
            // Set loading to false after all requests complete
            if (completedCount === totalRequests) {
              this.isLoading = false;
            }
          },
          error: (err) => {
            console.error(`WardrobePage - Error loading ${categoryLoader.type}:`, err);
            const category = this.categories.find((cat) => cat.type === categoryLoader.type);
            if (category) {
              category.count = 0; // Set to 0 on error
            }
            
            completedCount++;
            // Set loading to false after all requests complete (even on errors)
            if (completedCount === totalRequests) {
              this.isLoading = false;
            }
          },
        });
      }, delayTime);
    });
  }

  goToCategory(route: string): void {
    this.router.navigate([route]);
  }
}
