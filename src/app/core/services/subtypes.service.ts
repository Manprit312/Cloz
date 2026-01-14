import { Injectable } from '@angular/core';
import { Gender } from '@models/user.model';

export interface SubtypeOption {
  value: string;
  label: string;
  gender?: 'Male' | 'Female' | 'Both';
}

@Injectable({
  providedIn: 'root',
})
export class SubtypesService {
  // Subtype options by category with gender specification
  private subtypeOptions: Record<string, SubtypeOption[]> = {
    'upper-garments': [
      { value: 'T-shirt', label: 'T-shirt', gender: 'Both' },
      { value: 'Blouse', label: 'Blouse', gender: 'Female' },
      { value: 'Shirt', label: 'Shirt', gender: 'Both' },
      { value: 'Polo', label: 'Polo', gender: 'Both' },
      { value: 'Top', label: 'Top', gender: 'Both' },
      { value: 'Sweater', label: 'Sweater', gender: 'Both' },
      { value: 'Jacket', label: 'Jacket', gender: 'Both' },
      { value: 'Coat', label: 'Coat', gender: 'Both' },
      { value: 'Hoodie', label: 'Hoodie', gender: 'Both' },
      { value: 'Blazer', label: 'Blazer', gender: 'Both' },
      { value: 'Vest', label: 'Vest', gender: 'Both' },
      { value: 'Dress', label: 'Dress', gender: 'Female' },
    ],
    bottoms: [
      { value: 'Jeans', label: 'Jeans', gender: 'Both' },
      { value: 'Leggings', label: 'Leggings', gender: 'Both' },
      { value: 'Skirt', label: 'Skirt', gender: 'Female' },
      { value: 'Trousers', label: 'Trousers', gender: 'Both' },
      { value: 'Tailored Pants', label: 'Tailored Pants', gender: 'Both' },
      { value: 'Shorts', label: 'Shorts', gender: 'Both' },
      { value: 'Sweatpants', label: 'Sweatpants', gender: 'Both' },
      { value: 'Overalls', label: 'Overalls', gender: 'Both' },
      { value: 'Jumpsuits', label: 'Jumpsuits', gender: 'Female' },
    ],
    shoes: [
      { value: 'Sneakers', label: 'Sneakers', gender: 'Both' },
      { value: 'Boots', label: 'Boots', gender: 'Both' },
      { value: 'Heels', label: 'Heels', gender: 'Female' },
      { value: 'Sandals', label: 'Sandals', gender: 'Both' },
      { value: 'Dress shoes', label: 'Dress shoes', gender: 'Both' },
    ],
    accessories: [
      { value: 'Bags', label: 'Bags', gender: 'Both' },
      { value: 'Belts', label: 'Belts', gender: 'Both' },
      { value: 'Caps', label: 'Caps', gender: 'Both' },
      { value: 'Hats', label: 'Hats', gender: 'Both' },
    ],
  };

  /**
   * Get available subtypes for a category filtered by gender
   * @param category The category ('upper-garments', 'bottoms', 'shoes', 'accessories')
   * @param gender The user's gender ('Male' or 'Female')
   * @returns Array of subtype values (strings) including 'All' as the first item
   */
  getSubtypesForCategory(category: string, gender: Gender): string[] {
    const categoryKey = category === 'upper_garments' ? 'upper-garments' : category;
    const allOptions = this.subtypeOptions[categoryKey] || [];
    
    // Filter by gender: show items that are 'Both' or match the user's gender
    const filteredOptions = allOptions.filter(
      option =>
        !option.gender ||
        option.gender === 'Both' ||
        option.gender === gender
    );

    // Extract just the values and sort them
    const subtypes = filteredOptions.map(option => option.value).sort();
    
    // Always include 'All' as the first option
    return ['All', ...subtypes];
  }

  /**
   * Get all subtype options for a category (for subtype selection modal)
   * @param category The category
   * @param gender The user's gender
   * @returns Array of SubtypeOption objects
   */
  getSubtypeOptionsForCategory(category: string, gender: Gender): SubtypeOption[] {
    const categoryKey = category === 'upper_garments' ? 'upper-garments' : category;
    const allOptions = this.subtypeOptions[categoryKey] || [];
    
    return allOptions.filter(
      option =>
        !option.gender ||
        option.gender === 'Both' ||
        option.gender === gender
    );
  }
}





