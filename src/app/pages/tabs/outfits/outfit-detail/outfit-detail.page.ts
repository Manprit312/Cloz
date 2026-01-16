import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  AlertController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { OutfitsService, Outfit, OutfitWardrobeItem } from '../../../../core/services/outfits.service';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-outfit-detail',
  templateUrl: './outfit-detail.page.html',
  styleUrls: ['./outfit-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IconComponent,
    SkeletonLoaderComponent,
  ],
})
export class OutfitDetailPage implements OnInit, ViewWillEnter {
  outfit: Outfit | null = null;
  isLoading = false;
  error: string | null = null;

  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private outfitsService = inject(OutfitsService);
  private alertController = inject(AlertController);

  ngOnInit() {
    // Get outfit ID from route params
    const outfitId = this.route.snapshot.paramMap.get('id');
    
    if (outfitId) {
      this.loadOutfit(outfitId);
    } else {
      // Try to get outfit from state (if navigated from list)
      const state = history.state;
      if (state && state.outfit) {
        this.outfit = state.outfit;
      } else {
        this.error = 'Outfit not found';
      }
    }
  }

  ionViewWillEnter(): void {
    // Reload outfit data when returning to this page (e.g., after editing)
    const outfitId = this.route.snapshot.paramMap.get('id');
    if (outfitId) {
      this.loadOutfit(outfitId);
    }
  }

  loadOutfit(outfitId: string): void {
    this.isLoading = true;
    this.error = null;

    // For now, we'll get all outfits and find the one we need
    // In the future, you might want to add a getOutfitById method to the service
    this.outfitsService.getOutfits().subscribe({
      next: (outfits) => {
        const foundOutfit = outfits.find(o => o.id === outfitId);
        if (foundOutfit) {
          this.outfit = foundOutfit;
        } else {
          this.error = 'Outfit not found';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading outfit:', err);
        this.error = 'Failed to load outfit';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  onEdit(): void {
    if (!this.outfit || !this.outfit.id) {
      return;
    }

    this.router.navigate(['/tabs/outfits/edit-outfit', this.outfit.id], { 
      state: { outfit: this.outfit } 
    });
  }

  onDelete(): void {
    if (!this.outfit) {
      return;
    }

    this.alertController.create({
      header: 'Delete Outfit',
      message: `Are you sure you want to delete "${this.outfit.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteOutfit();
          },
        },
      ],
    }).then(alert => alert.present());
  }

  deleteOutfit(): void {
    if (!this.outfit) {
      return;
    }

    this.isLoading = true;
    this.outfitsService.deleteOutfit(this.outfit.id).subscribe({
      next: () => {
        console.log('Outfit deleted successfully');
        // Navigate back to outfits list
        this.router.navigate(['/tabs/outfits']);
      },
      error: (err) => {
        console.error('Error deleting outfit:', err);
        this.error = 'Failed to delete outfit';
        this.isLoading = false;
        
        // Show error alert
        this.alertController.create({
          header: 'Error',
          message: 'Failed to delete outfit. Please try again.',
          buttons: ['OK'],
        }).then(alert => alert.present());
      }
    });
  }

  getAllGarments(): OutfitWardrobeItem[] {
    if (!this.outfit || !this.outfit.outfitWardrobe) {
      return [];
    }

    // Flatten all items from all categories
    const allItems: OutfitWardrobeItem[] = [];
    this.outfit.outfitWardrobe.forEach((category) => {
      if (category.items && Array.isArray(category.items)) {
        allItems.push(...category.items);
      }
    });
    return allItems;
  }

  getGarmentDescription(item: OutfitWardrobeItem): string {
    const parts: string[] = [];
    
    if (item.color) {
      parts.push(item.color);
    }
    
    if (item.subtype) {
      parts.push(item.subtype);
    }
    
    if (item.brand) {
      parts.push(item.brand);
    }
    
    return parts.join(' ') || 'Garment';
  }

  getGarmentImage(item: OutfitWardrobeItem): string {
    // Check for images array (new structure)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // Sort images: primary first, then by displayOrder
      const sortedImages = [...item.images].sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      return sortedImages[0].imageUrl || '';
    }
    // Fallback to imageUrl or imageUrls (legacy/computed)
    return item.imageUrl || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : '');
  }

  onGarmentClick(garment: OutfitWardrobeItem): void {
    // Determine the route based on garment type
    let route: string;
    
    switch (garment.type) {
      case 'upper_garments':
        route = '/tabs/wardrobe/upper-garment-detail';
        break;
      case 'bottoms':
        route = '/tabs/wardrobe/bottom-detail';
        break;
      case 'shoes':
        route = '/tabs/wardrobe/shoe-detail';
        break;
      case 'accessories':
        route = '/tabs/wardrobe/accessory-detail';
        break;
      default:
        console.warn('Unknown garment type:', garment.type);
        return;
    }

    // Transform OutfitWardrobeItem to the format expected by detail pages
    // Extract imageUrl from images array if available
    let imageUrl = garment.imageUrl || '';
    let imageUrls: string[] = [];
    
    if (garment.images && Array.isArray(garment.images) && garment.images.length > 0) {
      // Sort images: primary first, then by displayOrder
      const sortedImages = [...garment.images].sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      imageUrls = sortedImages.map((img: any) => img.imageUrl).filter(Boolean);
      imageUrl = imageUrls[0] || imageUrl;
    } else if (garment.imageUrls && Array.isArray(garment.imageUrls)) {
      imageUrls = garment.imageUrls;
      imageUrl = imageUrls[0] || imageUrl;
    } else if (imageUrl) {
      imageUrls = [imageUrl];
    }
    
    const garmentItem = {
      id: garment.id,
      imageUrl: imageUrl,
      imageUrls: imageUrls,
      subtype: garment.subtype,
      color: garment.color,
      climateFit: Array.isArray(garment.climateFit) 
        ? garment.climateFit 
        : typeof garment.climateFit === 'string' 
          ? garment.climateFit.split(',').map(c => c.trim())
          : [],
      brand: garment.brand,
      createdAt: garment.createdAt,
      updatedAt: garment.updatedAt,
    };

    // Navigate to the appropriate detail page
    this.router.navigate([route], {
      state: { item: garmentItem },
    });
  }
}

