import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonItem,
  IonInput,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import {
  GarmentSelectionModalComponent,
  GarmentCategory,
  GarmentItem,
} from '../../../../shared/components/garment-selection-modal/garment-selection-modal.component';
import { UpperGarmentItem } from '../../wardrobe/upper-garments/upper-garments.page';
import { BottomItem } from '../../wardrobe/bottoms/bottoms.page';
import { ShoeItem } from '../../wardrobe/shoes/shoes.page';
import { AccessoryItem } from '../../wardrobe/accessories/accessories.page';
import { WardrobeService, WardrobeItem } from '../../../../core/services/wardrobe.service';
import { OutfitsService, Outfit, OutfitWardrobeItem } from '../../../../core/services/outfits.service';

@Component({
  selector: 'app-edit-outfit',
  templateUrl: './edit-outfit.page.html',
  styleUrls: ['./edit-outfit.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonItem,
    IonInput,
    IconComponent,
    ButtonComponent,
    SkeletonLoaderComponent,
  ],
})
export class EditOutfitPage implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private wardrobeService = inject(WardrobeService);
  private outfitsService = inject(OutfitsService);

  outfitId: string = '';
  outfitName: string = '';
  
  selectedUpperGarments: UpperGarmentItem[] = [];
  selectedBottoms: BottomItem[] = [];
  selectedShoes: ShoeItem[] = [];
  selectedAccessories: AccessoryItem[] = [];

  // Data loaded from API (cached after first load)
  upperGarments: UpperGarmentItem[] = [];
  bottoms: BottomItem[] = [];
  shoes: ShoeItem[] = [];
  accessories: AccessoryItem[] = [];

  // Track which categories have been loaded
  private loadedCategories = new Set<GarmentCategory>();

  isLoading = false;
  isSavingOutfit = false; // Track if outfit save is in progress
  isLoadingGarments = false; // Track if garments are being loaded

  constructor() {}

  ngOnInit() {
    // Get outfit ID from route params
    const outfitId = this.route.snapshot.paramMap.get('id');
    
    if (outfitId) {
      this.outfitId = outfitId;
      this.loadOutfit(outfitId);
    } else {
      // Try to get outfit from state (if navigated from detail page)
      const state = history.state;
      if (state && state.outfit) {
        this.outfitId = state.outfit.id;
        this.loadOutfitData(state.outfit);
      }
    }
  }

  loadOutfit(outfitId: string): void {
    this.isLoading = true;
    this.outfitsService.getOutfits().subscribe({
      next: (outfits) => {
        const foundOutfit = outfits.find(o => o.id === outfitId);
        if (foundOutfit) {
          this.loadOutfitData(foundOutfit);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading outfit:', err);
        this.isLoading = false;
      }
    });
  }

  loadOutfitData(outfit: Outfit): void {
    this.outfitName = outfit.name || '';
    this.outfitId = outfit.id;

    // Load garments from outfitWardrobe
    if (outfit.outfitWardrobe) {
      outfit.outfitWardrobe.forEach((category) => {
        if (category.items && category.items.length > 0) {
          category.items.forEach((item: OutfitWardrobeItem) => {
            const transformedItem = this.transformWardrobeItem(item);
            
            switch (category.type) {
              case 'upper_garments':
                this.selectedUpperGarments.push(transformedItem as UpperGarmentItem);
                break;
              case 'bottoms':
                this.selectedBottoms.push(transformedItem as BottomItem);
                break;
              case 'shoes':
                this.selectedShoes.push(transformedItem as ShoeItem);
                break;
              case 'accessories':
                this.selectedAccessories.push(transformedItem as AccessoryItem);
                break;
            }
          });
        }
      });
    }
  }

  private transformWardrobeItem(item: OutfitWardrobeItem): any {
    const climateFit = Array.isArray(item.climateFit) 
      ? item.climateFit 
      : typeof item.climateFit === 'string' 
        ? item.climateFit.split(',').map(c => c.trim())
        : [];

    return {
      id: item.id,
      imageUrl: item.imageUrl || '',
      imageUrls: item['imageUrls'] || (item.imageUrl ? [item.imageUrl] : undefined),
      subtype: item.subtype,
      color: item.color,
      climateFit: climateFit,
      brand: item.brand,
      createdAt: item.createdAt,
    };
  }

  /**
   * Load garments for a specific category
   */
  private loadGarmentsForCategory(category: GarmentCategory): Promise<void> {
    return new Promise((resolve, reject) => {
      let observable;

      switch (category) {
        case 'upper-garments':
          observable = this.wardrobeService.getUpperGarments();
          break;
        case 'bottoms':
          observable = this.wardrobeService.getBottoms();
          break;
        case 'shoes':
          observable = this.wardrobeService.getShoes();
          break;
        case 'accessories':
          observable = this.wardrobeService.getAccessories();
          break;
        default:
          resolve();
          return;
      }

      observable.pipe(
        catchError((err) => {
          console.error(`EditOutfitPage - Error loading ${category}:`, err);
          return of([]);
        })
      ).subscribe({
        next: (items) => {
          const transformedItems = items.map((item: WardrobeItem) => {
            switch (category) {
              case 'upper-garments':
                return this.transformToUpperGarmentItem(item);
              case 'bottoms':
                return this.transformToBottomItem(item);
              case 'shoes':
                return this.transformToShoeItem(item);
              case 'accessories':
                return this.transformToAccessoryItem(item);
              default:
                return item;
            }
          });

          switch (category) {
            case 'upper-garments':
              this.upperGarments = transformedItems as UpperGarmentItem[];
              break;
            case 'bottoms':
              this.bottoms = transformedItems as BottomItem[];
              break;
            case 'shoes':
              this.shoes = transformedItems as ShoeItem[];
              break;
            case 'accessories':
              this.accessories = transformedItems as AccessoryItem[];
              break;
          }

          this.loadedCategories.add(category);
          resolve();
        },
        error: (err) => {
          console.error(`EditOutfitPage - Unexpected error loading ${category}:`, err);
          reject(err);
        }
      });
    });
  }

  /**
   * Transform WardrobeItem from API to UpperGarmentItem format
   */
  private transformToUpperGarmentItem(item: WardrobeItem): UpperGarmentItem {
    const climateFit = Array.isArray(item.climateFit) 
      ? item.climateFit 
      : typeof item.climateFit === 'string' 
        ? item.climateFit.split(',').map(c => c.trim())
        : [];

    return {
      id: item.id,
      imageUrl: item.imageUrl || item['imageUrls']?.[0] || '',
      imageUrls: item['imageUrls'] || (item.imageUrl ? [item.imageUrl] : undefined),
      subtype: item.subtype,
      color: item.color,
      climateFit: climateFit,
      brand: item.brand,
      createdAt: item.createdAt,
    };
  }

  /**
   * Transform WardrobeItem from API to BottomItem format
   */
  private transformToBottomItem(item: WardrobeItem): BottomItem {
    const climateFit = Array.isArray(item.climateFit) 
      ? item.climateFit 
      : typeof item.climateFit === 'string' 
        ? item.climateFit.split(',').map(c => c.trim())
        : [];

    return {
      id: item.id,
      imageUrl: item.imageUrl || item['imageUrls']?.[0] || '',
      imageUrls: item['imageUrls'] || (item.imageUrl ? [item.imageUrl] : undefined),
      subtype: item.subtype,
      color: item.color,
      climateFit: climateFit,
      brand: item.brand,
      createdAt: item.createdAt,
    };
  }

  /**
   * Transform WardrobeItem from API to ShoeItem format
   */
  private transformToShoeItem(item: WardrobeItem): ShoeItem {
    const climateFit = Array.isArray(item.climateFit) 
      ? item.climateFit 
      : typeof item.climateFit === 'string' 
        ? item.climateFit.split(',').map(c => c.trim())
        : [];

    return {
      id: item.id,
      imageUrl: item.imageUrl || item['imageUrls']?.[0] || '',
      imageUrls: item['imageUrls'] || (item.imageUrl ? [item.imageUrl] : undefined),
      subtype: item.subtype,
      color: item.color,
      climateFit: climateFit,
      brand: item.brand,
      createdAt: item.createdAt,
    };
  }

  /**
   * Transform WardrobeItem from API to AccessoryItem format
   */
  private transformToAccessoryItem(item: WardrobeItem): AccessoryItem {
    const climateFit = Array.isArray(item.climateFit) 
      ? item.climateFit 
      : typeof item.climateFit === 'string' 
        ? item.climateFit.split(',').map(c => c.trim())
        : [];

    return {
      id: item.id,
      imageUrl: item.imageUrl || item['imageUrls']?.[0] || '',
      imageUrls: item['imageUrls'] || (item.imageUrl ? [item.imageUrl] : undefined),
      subtype: item.subtype,
      color: item.color,
      climateFit: climateFit,
      brand: item.brand,
      createdAt: item.createdAt,
    };
  }

  goBack(): void {
    this.location.back();
  }

  async openGarmentModal(category: GarmentCategory) {
    // Prevent multiple clicks while loading
    if (this.isLoadingGarments) {
      return;
    }

    this.isLoadingGarments = true;

    try {
      // Load garments for this category if not already loaded
      if (!this.loadedCategories.has(category)) {
        await this.loadGarmentsForCategory(category);
      }

      let allGarments: GarmentItem[] = [];

      switch (category) {
        case 'upper-garments':
          allGarments = this.upperGarments as GarmentItem[];
          break;
        case 'bottoms':
          allGarments = this.bottoms as GarmentItem[];
          break;
        case 'shoes':
          allGarments = this.shoes as GarmentItem[];
          break;
        case 'accessories':
          allGarments = this.accessories as GarmentItem[];
          break;
      }

      // Filter out already selected garments
      const selectedGarments = this.getSelectedGarments(category);
      const selectedIds = new Set(selectedGarments.map(g => g.id));
      const garments = allGarments.filter(g => !selectedIds.has(g.id));

      this.isLoadingGarments = false;

      // If no garments available, show message and return
      if (garments.length === 0) {
        const categoryName = this.getCategoryDisplayName(category);
        const toast = await this.toastController.create({
          message: `All ${categoryName} are already selected`,
          duration: 2000,
          position: 'bottom',
          color: 'medium',
        });
        await toast.present();
        return;
      }

      // Open modal with loaded data
      const modal = await this.modalController.create({
        component: GarmentSelectionModalComponent,
        componentProps: {
          category,
          garments,
          isLoading: false,
        },
      });

      await modal.present();

      const { data, role } = await modal.onWillDismiss();

      if (role === 'confirm' && data) {
        this.handleGarmentSelection(category, data);
      }
    } catch (error) {
      console.error('Error loading garments:', error);
      this.isLoadingGarments = false;
      
      const toast = await this.toastController.create({
        message: 'Failed to load garments. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }

  private async getModalComponent(modal: any): Promise<GarmentSelectionModalComponent | null> {
    try {
      // Access component instance using componentRef (proper Ionic way)
      const componentInstance = modal.componentRef?.instance as GarmentSelectionModalComponent;
      if (componentInstance && typeof componentInstance.updateGarments === 'function') {
        return componentInstance;
      }
      
      // Fallback: try alternative access methods
      const altInstance = (modal as any).componentInstance as GarmentSelectionModalComponent;
      if (altInstance && typeof altInstance.updateGarments === 'function') {
        return altInstance;
      }
      
      return null;
    } catch (error) {
      console.warn('Could not access modal component:', error);
      return null;
    }
  }

  private handleGarmentSelection(category: GarmentCategory, garment: GarmentItem) {
    switch (category) {
      case 'upper-garments':
        this.selectedUpperGarments.push(garment as UpperGarmentItem);
        break;
      case 'bottoms':
        this.selectedBottoms.push(garment as BottomItem);
        break;
      case 'shoes':
        this.selectedShoes.push(garment as ShoeItem);
        break;
      case 'accessories':
        this.selectedAccessories.push(garment as AccessoryItem);
        break;
    }
  }

  removeGarment(category: GarmentCategory, garmentId: string): void {
    switch (category) {
      case 'upper-garments':
        this.selectedUpperGarments = this.selectedUpperGarments.filter(g => g.id !== garmentId);
        break;
      case 'bottoms':
        this.selectedBottoms = this.selectedBottoms.filter(g => g.id !== garmentId);
        break;
      case 'shoes':
        this.selectedShoes = this.selectedShoes.filter(g => g.id !== garmentId);
        break;
      case 'accessories':
        this.selectedAccessories = this.selectedAccessories.filter(g => g.id !== garmentId);
        break;
    }
  }

  getSelectedGarments(category: GarmentCategory): GarmentItem[] {
    switch (category) {
      case 'upper-garments':
        return this.selectedUpperGarments as GarmentItem[];
      case 'bottoms':
        return this.selectedBottoms as GarmentItem[];
      case 'shoes':
        return this.selectedShoes as GarmentItem[];
      case 'accessories':
        return this.selectedAccessories as GarmentItem[];
      default:
        return [];
    }
  }

  hasSelectedGarment(category: GarmentCategory): boolean {
    return this.getSelectedGarments(category).length > 0;
  }

  private getCategoryDisplayName(category: GarmentCategory): string {
    const names: Record<GarmentCategory, string> = {
      'upper-garments': 'upper garments',
      'bottoms': 'bottoms',
      'shoes': 'shoes',
      'accessories': 'accessories',
    };
    return names[category] || 'items';
  }

  get canSaveOutfit(): boolean {
    // Require outfit name and at least 2 garments total (same as create)
    const totalGarments = 
      this.selectedUpperGarments.length +
      this.selectedBottoms.length +
      this.selectedShoes.length +
      this.selectedAccessories.length;
    return !!(this.outfitName.trim() && totalGarments >= 2);
  }

  onSaveOutfit(): void {
    // Prevent double submission
    if (!this.canSaveOutfit || this.isSavingOutfit) {
      return;
    }

    this.isSavingOutfit = true;
    this.isLoading = true;

    // Collect all selected wardrobe IDs
    const wardrobeIds: string[] = [
      ...this.selectedUpperGarments.map(g => g.id),
      ...this.selectedBottoms.map(g => g.id),
      ...this.selectedShoes.map(g => g.id),
      ...this.selectedAccessories.map(g => g.id),
    ];

    // Update outfit request
    const outfitData = {
      name: this.outfitName.trim(),
      wardrobeIds: wardrobeIds,
    };

    this.outfitsService.updateOutfit(this.outfitId, outfitData).subscribe({
      next: (outfit) => {
        console.log('Outfit updated successfully:', outfit);
        this.isLoading = false;
        this.isSavingOutfit = false;
        // Navigate back after update
        this.location.back();
      },
      error: (err) => {
        console.error('Error updating outfit:', err);
        this.isLoading = false;
        this.isSavingOutfit = false;
        // TODO: Show error message to user
        this.location.back();
      }
    });
  }
}

