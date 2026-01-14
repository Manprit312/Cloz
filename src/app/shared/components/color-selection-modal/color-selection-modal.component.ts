import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { 
  PRIMARY_COLORS, 
  COLOR_FAMILIES, 
  ColorToken,
  getColorVariations,
  getBaseLevelColor 
} from '@shared/constants/color-tokens';


export interface ColorOption {
  value: string;
  label: string;
  hex: string;
  gradient?: string;
  cssVar?: string;
}

@Component({
  selector: 'app-color-selection-modal',
  templateUrl: './color-selection-modal.component.html',
  styleUrls: ['./color-selection-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonIcon,
  ],
})
export class ColorSelectionModalComponent implements OnInit {
  @Input() currentColor: string = '';

  selectedColor: string = '';
  viewingShades: boolean = false;
  viewingVariations: boolean = false;
  selectedColorFamily: string = '';
  selectedShadeLevel: string = '';
  currentShades: ColorOption[] = [];
  currentVariations: ColorOption[] = [];

  // Primary colors from Figma tokens with generated gradients
  primaryColors: ColorOption[] = this.generatePrimaryColors();

  // Generate primary colors with gradients from Figma tokens
  private generatePrimaryColors(): ColorOption[] {
    const colors = PRIMARY_COLORS.map((token: ColorToken) => {
      const family = COLOR_FAMILIES.find((f: any) => f.name === token.value);
      let gradient = '';
      
      if (family) {
        // Create gradient using "soft" variations from each darkness level
        // This matches the Figma design: extraDark/soft → dark/soft → mid/soft → light/soft → extraLight/soft
        const softColors = family.levels
          .map(level => level.variations.find(v => v.label.includes('Soft')))
          .filter(v => v !== undefined)
          .map(v => v!.hex);
        
        if (softColors.length >= 2) {
          gradient = `linear-gradient(to right, ${softColors.join(', ')})`;
        }
      }
      
      return {
        value: token.value,
        label: token.label,
        hex: token.hex,
        gradient,
        cssVar: token.cssVar
      };
    });
    
    return colors;
  }

  // Generate shade display data from Figma tokens
  getShadeDisplayData(colorFamily: string): ColorOption[] {
    const family = COLOR_FAMILIES.find(f => f.name === colorFamily);
    if (!family) return [];
    
    return family.levels.map(level => {
      // Use "Soft" variant as the base color for display
      const softVariation = level.variations.find(v => v.label.includes('Soft'));
      const baseColor = softVariation || level.variations[1] || level.variations[0];
      
      return {
        value: level.name,
        label: level.name,
        hex: baseColor.hex,
        gradient: '',
        cssVar: baseColor.cssVar
      };
    });
  }

  // Get color variations for a specific shade level
  getColorVariations(colorFamily: string, levelName: string): ColorOption[] {
    const family = COLOR_FAMILIES.find(f => f.name === colorFamily);
    if (!family) return [];
    
    const level = family.levels.find(l => l.name === levelName);
    if (!level) return [];
    
    return level.variations.map(v => ({
      value: v.value,
      label: v.label,
      hex: v.hex,
      gradient: '',
      cssVar: v.cssVar
    }));
  }

  // Check if color family has shade levels
  hasShades(colorValue: string): boolean {
    return COLOR_FAMILIES.some((f: any) => f.name === colorValue);
  }

  // Removed hardcoded colorVariations - now generated dynamically from Figma tokens

  constructor(private modalController: ModalController) {
    // Register icons
    addIcons({ chevronForwardOutline, chevronBackOutline });
  }

  ngOnInit() {
    this.selectedColor = this.currentColor;
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onColorClick(color: ColorOption) {
    // If color has shades, show shades view
    if (this.hasShades(color.value)) {
      this.selectedColorFamily = color.value;
      this.currentShades = this.getShadeDisplayData(color.value);
      this.viewingShades = true;
      this.viewingVariations = false;
    } else {
      // For White, Black, Print - select directly (no shades)
      // Gray has shades, so it will go through the shades view
      this.onColorChange(color.value);
    }
  }

  onShadeClick(shade: ColorOption) {
    // Get variations for this shade level
    const variations = this.getColorVariations(this.selectedColorFamily, shade.value);
    if (variations && variations.length > 0) {
      // If there's only one variation (like Gray), select it directly
      if (variations.length === 1) {
        this.onVariationClick(variations[0]);
      } else {
        // Show variations view for colors with multiple variations
        this.selectedShadeLevel = shade.value;
        this.currentVariations = variations;
        this.viewingVariations = true;
      }
    }
  }

  onVariationClick(variation: ColorOption) {
    this.selectedColor = variation.value;
    this.modalController.dismiss(variation.value, 'confirm');
  }

  backToColors() {
    this.viewingShades = false;
    this.viewingVariations = false;
    this.selectedColorFamily = '';
    this.selectedShadeLevel = '';
    this.currentShades = [];
    this.currentVariations = [];
  }

  backToShades() {
    this.viewingVariations = false;
    this.selectedShadeLevel = '';
    this.currentVariations = [];
  }

  onColorChange(value: string) {
    this.selectedColor = value;
    // Auto-dismiss on selection
    this.modalController.dismiss(value, 'confirm');
  }

  getColorHex(colorValue: string): string {
    const color = this.primaryColors.find(c => c.value === colorValue);
    return color ? color.hex : '#000000';
  }

  // Check if color label indicates a light color (needs dark text)
  isLightColor(label: string): boolean {
    return label.includes('Light') || label.includes('light');
  }
}

