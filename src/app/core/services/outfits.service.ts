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

export interface OutfitWardrobeItem {
  id: string;
  userId?: string;
  type: string;
  subtype: string;
  color: string;
  climateFit: string | string[];
  brand?: string | null;
  imageUrl: string;
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
        if (Array.isArray(response)) {
          return response;
        }
        return response?.outfits || response?.data || [];
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
    return this.http.post<Outfit>(url, outfitData);
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
    return this.http.put<Outfit>(url, outfitData);
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
}

