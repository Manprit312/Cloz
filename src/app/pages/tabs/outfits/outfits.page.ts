import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OutfitsService, Outfit } from '../../../core/services/outfits.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-outfits',
  templateUrl: './outfits.page.html',
  styleUrls: ['./outfits.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonFabButton, CommonModule, FormsModule, EmptyStateComponent, IconComponent, SkeletonLoaderComponent]
})
export class OutfitsPage implements OnInit {
  private router = inject(Router);
  private outfitsService = inject(OutfitsService);
  outfits: Outfit[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() { }

  ngOnInit() {
    this.loadOutfits();
  }

  ionViewWillEnter(): void {
    // Reload outfits when returning to this page (e.g., after creating a new outfit)
    this.loadOutfits();
  }

  loadOutfits(): void {
    this.isLoading = true;
    this.error = null;

    this.outfitsService.getOutfits().subscribe({
      next: (outfits) => {
        this.outfits = outfits;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading outfits:', err);
        this.error = 'Failed to load outfits';
        this.isLoading = false;
      }
    });
  }

  onCreateOutfit(): void {
    this.router.navigate(['/tabs/outfits/create-outfit']);
  }

  onOutfitClick(outfit: Outfit): void {
    this.router.navigate(['/tabs/outfits/outfit-detail', outfit.id], {
      state: { outfit }
    });
  }

  getOutfitGarments(outfit: Outfit): any[] {
    // Extract all items from outfitWardrobe array
    if (outfit.outfitWardrobe && Array.isArray(outfit.outfitWardrobe)) {
      // Flatten the array: get all items from all categories
      const allItems: any[] = [];
      outfit.outfitWardrobe.forEach((category) => {
        if (category.items && Array.isArray(category.items)) {
          allItems.push(...category.items);
        }
      });
      return allItems;
    }
    // Otherwise return empty array
    return [];
  }

  getGarmentImage(item: any): string {
    if (item.imageUrl) {
      return item.imageUrl;
    }
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    // Return placeholder or empty string
    return '';
  }

}
