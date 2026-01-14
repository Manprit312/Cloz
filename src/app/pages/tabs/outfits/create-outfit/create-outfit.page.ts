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
 
    

    IconComponent,
    ButtonComponent,
  ],
})
export class CreateOutfitPage implements OnInit {
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

  constructor() {}

  ngOnInit() {
    // Don't load all garments upfront - load on demand when modal opens
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

    const modal = await this.modalController.create({
      component: GarmentSelectionModalComponent,
      componentProps: {
        category,
        garments,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.handleGarmentSelection(category, data);
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
    return !!(
      this.selectedUpperGarments.length > 0 &&
      this.selectedBottoms.length > 0 &&
      this.selectedShoes.length > 0 &&
      this.selectedAccessories.length > 0
    );
  }

  async onCreateOutfit(): Promise<void> {
    // Prevent double submission
    if (!this.canCreateOutfit || this.isCreatingOutfit) {
      return;
    }

    // TODO: Fetch suggested names from API if available
    // For now, use default suggested names
    // When fetching from API, show loader here: this.isLoading = true;
    const suggestedNames = [
      'The Sand & Sky Commuter',
      'Weekend Tailored',
      'The Friday Shift',
    ];

    // Open naming modal
    const modal = await this.modalController.create({
      component: OutfitNamingModalComponent,
      componentProps: {
        suggestedNames: suggestedNames,
      },
      breakpoints: [0, 0.5],
      initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      // User selected/entered a name, now create the outfit with loader
      this.createOutfitWithName(data);
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

