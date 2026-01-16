import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateOutfitRequest {
  name: string;
  wardrobeIds: string[];
}

export interface UpdateOutfitRequest {
  name: string;
  wardrobeIds: string[];
}

export interface OutfitImage {
  id: string;
  wardrobeId: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutfitWardrobeItem {
  id: string;
  userId?: string;
  type: string;
  subtype: string;
  color: string;
  climateFit: string | string[];
  brand?: string | null;
  images?: OutfitImage[]; // New structure: array of image objects
  imageUrl?: string; // Legacy/computed: primary image URL
  imageUrls?: string[]; // Legacy/computed: array of image URLs
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface OutfitWardrobeCategory {
  type: string; // 'upper_garments', 'bottoms', 'shoes', 'accessories'
  items: OutfitWardrobeItem[];
}

export interface Outfit {
  id: string;
  name: string;
  wardrobeIds?: string[];
  outfitWardrobe?: OutfitWardrobeCategory[]; // Items grouped by type
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface GetOutfitsResponse {
  outfits?: Outfit[];
  data?: Outfit[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class OutfitsService {
  private http = inject(HttpClient);

  /**
   * Transform outfit wardrobe item to include imageUrl and imageUrls from images array
   */
  private transformOutfitWardrobeItem(item: OutfitWardrobeItem): OutfitWardrobeItem {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      // Sort images: primary first, then by displayOrder
      const sortedImages = [...item.images].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.displayOrder - b.displayOrder;
      });
      
      // Extract image URLs
      const imageUrls = sortedImages.map(img => img.imageUrl).filter(Boolean);
      
      // Set primary imageUrl and imageUrls array for backward compatibility
      return {
        ...item,
        imageUrl: imageUrls[0] || item.imageUrl || '',
        imageUrls: imageUrls.length > 0 ? imageUrls : (item.imageUrl ? [item.imageUrl] : []),
      };
    }
    
    // If no images array, keep existing imageUrl/imageUrls
    return item;
  }

  /**
   * Transform outfit to include imageUrl and imageUrls in all wardrobe items
   */
  private transformOutfit(outfit: Outfit): Outfit {
    if (outfit.outfitWardrobe && Array.isArray(outfit.outfitWardrobe)) {
      const transformedWardrobe = outfit.outfitWardrobe.map(category => ({
        ...category,
        items: category.items.map(item => this.transformOutfitWardrobeItem(item))
      }));
      
      return {
        ...outfit,
        outfitWardrobe: transformedWardrobe
      };
    }
    
    return outfit;
  }

  /**
   * Get all outfits
   * @returns Observable with the outfits array
   */
  getOutfits(): Observable<Outfit[]> {
    const url = `${environment.backendBaseUrl}/outfits`;
    
    // The interceptor will automatically add the Authorization header
    return this.http.get<GetOutfitsResponse | Outfit[]>(url).pipe(
      // Map the response to extract outfits array
      // Handle different possible response structures
      map((response) => {
        let outfits: Outfit[] = [];
        if (Array.isArray(response)) {
          outfits = response;
        } else {
          outfits = response?.outfits || response?.data || [];
        }
        
        // Transform each outfit to convert images arrays to imageUrl/imageUrls
        return outfits.map(outfit => this.transformOutfit(outfit));
      })
    );
  }

  /**
   * Create a new outfit
   * @param outfitData The outfit data (name and wardrobeIds)
   * @returns Observable with the created outfit
   */
  createOutfit(outfitData: CreateOutfitRequest): Observable<Outfit> {
    const url = `${environment.backendBaseUrl}/outfits/create`;
    
    // The interceptor will automatically add the Authorization header
    return this.http.post<Outfit | { data?: Outfit }>(url, outfitData).pipe(
      map((response) => {
        const outfit = (response as any)?.data || response;
        return this.transformOutfit(outfit as Outfit);
      })
    );
  }

  /**
   * Update an existing outfit
   * @param outfitId The ID of the outfit to update
   * @param outfitData The updated outfit data (name and wardrobeIds)
   * @returns Observable with the updated outfit
   */
  updateOutfit(outfitId: string, outfitData: UpdateOutfitRequest): Observable<Outfit> {
    const url = `${environment.backendBaseUrl}/outfits/${outfitId}`;
    
    // The interceptor will automatically add the Authorization header
    return this.http.put<Outfit | { data?: Outfit }>(url, outfitData).pipe(
      map((response) => {
        const outfit = (response as any)?.data || response;
        return this.transformOutfit(outfit as Outfit);
      })
    );
  }

  /**
   * Delete an outfit
   * @param outfitId The ID of the outfit to delete
   * @returns Observable with the response
   */
  deleteOutfit(outfitId: string): Observable<any> {
    const url = `${environment.backendBaseUrl}/outfits/${outfitId}`;
    
    // The interceptor will automatically add the Authorization header
    return this.http.delete<any>(url);
  }

  /**
   * Generate outfit name suggestions based on garment images
   * @param imageUrls Array of image URLs from selected garments
   * @returns Observable with array of suggested outfit names
   */
  generateOutfitNames(imageUrls: string[]): Observable<string[]> {
    const url = `${environment.backendBaseUrl}/outfits/outfitnamegeneration`;
    const body = { imageUrls };
    
    // The interceptor will automatically add the Authorization header
    return this.http.post<any>(url, body).pipe(
      map((response) => {
        // Handle different possible response structures
        // Response can be: { data: { outfit_names: [...] } } or { outfit_names: [...] } or [...]
        if (Array.isArray(response)) {
          return response;
        }
        // Check for data.outfit_names (most common structure)
        if (response?.data?.outfit_names && Array.isArray(response.data.outfit_names)) {
          return response.data.outfit_names;
        }
        // Check for outfit_names at root level
        if (response?.outfit_names && Array.isArray(response.outfit_names)) {
          return response.outfit_names;
        }
        // Check for names or data arrays
        if (response?.names && Array.isArray(response.names)) {
          return response.names;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Fallback to empty array
        return [];
      })
    );
  }
}

