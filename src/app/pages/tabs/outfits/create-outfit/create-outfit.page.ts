import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonSpinner,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  GarmentSelectionModalComponent,
  GarmentCategory,
  GarmentItem,
} from '../../../../shared/components/garment-selection-modal/garment-selection-modal.component';
import { OutfitNamingModalComponent } from '../../../../shared/components/outfit-naming-modal/outfit-naming-modal.component';
import { UpperGarmentItem } from '../../wardrobe/upper-garments/upper-garments.page';
import { BottomItem } from '../../wardrobe/bottoms/bottoms.page';
import { ShoeItem } from '../../wardrobe/shoes/shoes.page';
import { AccessoryItem } from '../../wardrobe/accessories/accessories.page';
import { WardrobeService, WardrobeItem } from '../../../../core/services/wardrobe.service';
import { OutfitsService } from '../../../../core/services/outfits.service';

@Component({
  selector: 'app-create-outfit',
  templateUrl: './create-outfit.page.html',
  styleUrls: ['./create-outfit.page.scss'],
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
    IonSpinner,
    IconComponent,
    ButtonComponent,
  ],
})
export class CreateOutfitPage implements OnInit, OnDestroy {
  private location = inject(Location);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private wardrobeService = inject(WardrobeService);
  private outfitsService = inject(OutfitsService);

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
  isCreatingOutfit = false; // Track if outfit creation is in progress
  isLoadingGarments = false; // Track if garments are being loaded
  isLoadingOutfitNames = false; // Track if outfit names are being fetched
  private namingModal?: any; // Track naming modal instance
  private isNamingModalOpen = false; // Track if naming modal is currently open

  constructor() {}

  ngOnInit() {
    // Don't load all garments upfront - load on demand when modal opens
  }

  ngOnDestroy() {
    // Ensure modal is dismissed when component is destroyed
    if (this.namingModal) {
      this.namingModal.dismiss().catch(() => {
        // Ignore errors if modal is already dismissed
      });
      this.namingModal = undefined;
    }
    this.isNamingModalOpen = false;
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
      imageUrl: item.imageUrl || item.imageUrls?.[0] || '',
      imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : undefined),
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
      imageUrl: item.imageUrl || item.imageUrls?.[0] || '',
      imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : undefined),
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
      imageUrl: item.imageUrl || item.imageUrls?.[0] || '',
      imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : undefined),
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
      imageUrl: item.imageUrl || item.imageUrls?.[0] || '',
      imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : undefined),
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

      this.isLoadingGarments = false;

      // If user doesn't have any garments in this category, show empty state message
      if (allGarments.length === 0) {
        const categoryName = this.getCategoryDisplayName(category);
        const toast = await this.toastController.create({
          message: `You don't have any ${categoryName} yet.\nAdd ${categoryName} to your wardrobe to use them in outfits`,
          duration: 3000,
          position: 'bottom',
          color: 'medium',
          cssClass: 'empty-state-toast',
        });
        await toast.present();
        return;
      }

      // Filter out already selected garments
      const selectedGarments = this.getSelectedGarments(category);
      const selectedIds = new Set(selectedGarments.map(g => g.id));
      const garments = allGarments.filter(g => !selectedIds.has(g.id));

      // If all garments are already selected, show message and return
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
          console.error(`CreateOutfitPage - Error loading ${category}:`, err);
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
          console.error(`CreateOutfitPage - Unexpected error loading ${category}:`, err);
          reject(err);
        }
      });
    });
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

  get canCreateOutfit(): boolean {
    // Require at least 2 garments total across all categories
    const totalGarments = 
      this.selectedUpperGarments.length +
      this.selectedBottoms.length +
      this.selectedShoes.length +
      this.selectedAccessories.length;
    return totalGarments >= 2;
  }

  async onCreateOutfit(): Promise<void> {
    // Prevent double submission or reopening modal
    if (!this.canCreateOutfit || this.isCreatingOutfit || this.isNamingModalOpen || this.isLoadingOutfitNames) {
      return;
    }

    // Set flags to prevent multiple clicks and show loading state
    this.isNamingModalOpen = true;
    this.isLoadingOutfitNames = true;

    // Collect all image URLs from selected garments
    const imageUrls: string[] = [];
    
    // Get image URLs from all selected garments
    [...this.selectedUpperGarments, ...this.selectedBottoms, ...this.selectedShoes, ...this.selectedAccessories].forEach(garment => {
      if (garment.imageUrls && Array.isArray(garment.imageUrls) && garment.imageUrls.length > 0) {
        // Use the first image URL from the array
        imageUrls.push(garment.imageUrls[0]);
      } else if (garment.imageUrl) {
        imageUrls.push(garment.imageUrl);
      }
    });

    // Fetch suggested names from API
    let suggestedNames: string[] = [];
    
    try {
      if (imageUrls.length > 0) {
        // Call API to get suggested names
        this.outfitsService.generateOutfitNames(imageUrls).subscribe({
          next: (names) => {
            suggestedNames = names && names.length > 0 ? names : this.getDefaultSuggestedNames();
            this.isLoadingOutfitNames = false;
            this.openNamingModalWithNames(suggestedNames);
          },
          error: (error) => {
            console.error('Error fetching outfit name suggestions:', error);
            // Fallback to default names if API fails
            suggestedNames = this.getDefaultSuggestedNames();
            this.isLoadingOutfitNames = false;
            this.openNamingModalWithNames(suggestedNames);
          }
        });
      } else {
        // No images available, use default names
        suggestedNames = this.getDefaultSuggestedNames();
        this.isLoadingOutfitNames = false;
        this.openNamingModalWithNames(suggestedNames);
      }
    } catch (error) {
      console.error('Error preparing outfit name suggestions:', error);
      suggestedNames = this.getDefaultSuggestedNames();
      this.isLoadingOutfitNames = false;
      this.openNamingModalWithNames(suggestedNames);
    }
  }

  private getDefaultSuggestedNames(): string[] {
    return [
      'The Sand & Sky Commuter',
      'Weekend Tailored',
      'The Friday Shift',
    ];
  }

  private async openNamingModalWithNames(suggestedNames: string[]): Promise<void> {
    try {
      // Open naming modal
      const modal = await this.modalController.create({
        component: OutfitNamingModalComponent,
        componentProps: {
          suggestedNames: suggestedNames,
        },
        breakpoints: [0, 0.5, 0.9],
        initialBreakpoint: 0.5,
        backdropDismiss: false, // Prevent backdrop dismissal
        keyboardClose: false, // Keep modal open when keyboard appears
      });

      // Track modal instance
      this.namingModal = modal;

      await modal.present();
      
      // Clear loading flag once modal is presented
      this.isLoadingOutfitNames = false;

      // Wait for modal to fully dismiss before proceeding
      const { data, role } = await modal.onDidDismiss();

      // Clear flags and modal reference
      this.isNamingModalOpen = false;
      this.namingModal = undefined;

      if (role === 'confirm' && data) {
        // User selected/entered a name, now create the outfit with loader
        // Add small delay to ensure modal is fully closed
        setTimeout(() => {
          this.createOutfitWithName(data);
        }, 200);
      } else {
        // Modal was cancelled, reset flag
        this.isNamingModalOpen = false;
      }
    } catch (error) {
      console.error('Error opening naming modal:', error);
      this.isNamingModalOpen = false;
      this.isLoadingOutfitNames = false;
      this.namingModal = undefined;
    }
  }

  private createOutfitWithName(outfitName: string): void {
    this.isCreatingOutfit = true;
    this.isLoading = true;

    // Collect all selected wardrobe IDs
    const wardrobeIds: string[] = [
      ...this.selectedUpperGarments.map(g => g.id),
      ...this.selectedBottoms.map(g => g.id),
      ...this.selectedShoes.map(g => g.id),
      ...this.selectedAccessories.map(g => g.id),
    ];

    // Create outfit request
    const outfitData = {
      name: outfitName || 'New Outfit',
      wardrobeIds: wardrobeIds,
    };

    this.outfitsService.createOutfit(outfitData).subscribe({
      next: (outfit) => {
        console.log('Outfit created successfully:', outfit);
        this.isLoading = false;
        this.isCreatingOutfit = false;
        // Navigate back after creation
        this.location.back();
      },
      error: (err) => {
        console.error('Error creating outfit:', err);
        this.isLoading = false;
        this.isCreatingOutfit = false;
        // TODO: Show error message to user
        // For now, still navigate back (user will see if creation failed when they return)
        this.location.back();
      }
    });
  }
}

