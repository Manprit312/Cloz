import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
import { UpperGarmentItem } from '../../wardrobe/upper-garments/upper-garments.page';
import { BottomItem } from '../../wardrobe/bottoms/bottoms.page';
import { ShoeItem } from '../../wardrobe/shoes/shoes.page';
import { AccessoryItem } from '../../wardrobe/accessories/accessories.page';
import { WardrobeService, WardrobeItem } from '../../../../core/services/wardrobe.service';

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
    IonItem,
    
    IonInput,
    IconComponent,
    ButtonComponent,
  ],
})
export class CreateOutfitPage implements OnInit {
  private location = inject(Location);
  private modalController = inject(ModalController);
  private wardrobeService = inject(WardrobeService);

  outfitName: string = '';
  selectedUpperGarments: UpperGarmentItem[] = [];
  selectedBottoms: BottomItem[] = [];
  selectedShoes: ShoeItem[] = [];
  selectedAccessories: AccessoryItem[] = [];

  // Data loaded from API
  upperGarments: UpperGarmentItem[] = [];
  bottoms: BottomItem[] = [];
  shoes: ShoeItem[] = [];
  accessories: AccessoryItem[] = [];

  isLoading = false;

  constructor() {}

  ngOnInit() {
    this.loadAllGarments();
  }

  /**
   * Load all garments from API
   */
  loadAllGarments(): void {
    this.isLoading = true;
    
    // Load all categories in parallel using forkJoin
    // Use catchError on each observable to handle errors gracefully
    forkJoin({
      upperGarments: this.wardrobeService.getUpperGarments().pipe(
        catchError((err) => {
          console.error('CreateOutfitPage - Error loading upper garments:', err);
          return of([]);
        })
      ),
      bottoms: this.wardrobeService.getBottoms().pipe(
        catchError((err) => {
          console.error('CreateOutfitPage - Error loading bottoms:', err);
          return of([]);
        })
      ),
      shoes: this.wardrobeService.getShoes().pipe(
        catchError((err) => {
          console.error('CreateOutfitPage - Error loading shoes:', err);
          return of([]);
        })
      ),
      accessories: this.wardrobeService.getAccessories().pipe(
        catchError((err) => {
          console.error('CreateOutfitPage - Error loading accessories:', err);
          return of([]);
        })
      ),
    }).subscribe({
      next: (results) => {
        this.upperGarments = results.upperGarments.map((item) => this.transformToUpperGarmentItem(item));
        this.bottoms = results.bottoms.map((item) => this.transformToBottomItem(item));
        this.shoes = results.shoes.map((item) => this.transformToShoeItem(item));
        this.accessories = results.accessories.map((item) => this.transformToAccessoryItem(item));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('CreateOutfitPage - Unexpected error loading garments:', err);
        this.isLoading = false;
      }
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
    let garments: GarmentItem[] = [];

    switch (category) {
      case 'upper-garments':
        garments = this.upperGarments as GarmentItem[];
        break;
      case 'bottoms':
        garments = this.bottoms as GarmentItem[];
        break;
      case 'shoes':
        garments = this.shoes as GarmentItem[];
        break;
      case 'accessories':
        garments = this.accessories as GarmentItem[];
        break;
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

  get canCreateOutfit(): boolean {
    return !!(
      this.selectedUpperGarments.length > 0 &&
      this.selectedBottoms.length > 0 &&
      this.selectedShoes.length > 0 &&
      this.selectedAccessories.length > 0
    );
  }

  onCreateOutfit(): void {
    if (!this.canCreateOutfit) {
      return;
    }

    // TODO: Implement outfit creation logic
    console.log('Creating outfit:', {
      name: this.outfitName,
      upperGarments: this.selectedUpperGarments,
      bottoms: this.selectedBottoms,
      shoes: this.selectedShoes,
      accessories: this.selectedAccessories,
    });
    
    // Navigate back after creation
    this.location.back();
  }
}

