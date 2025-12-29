import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface AddWardrobeItemRequest {
  type: string; // 'bottoms', 'upper_garments', 'shoes', 'accessories'
  subtype: string;
  color: string;
  climatefit: string; // Comma-separated string or single value
  brand?: string;
  image: File | string; // File object or base64 string
}

export interface UpdateWardrobeItemRequest {
  type?: string;
  subtype?: string;
  color?: string;
  climatefit?: string; // Comma-separated string or single value
  brand?: string;
  image?: File | string; // File object or base64 string
}

export interface AddWardrobeItemResponse {
  // Add response fields based on your backend response
  id?: string;
  message?: string;
  [key: string]: any;
}

export interface UpdateWardrobeItemResponse {
  id?: string;
  message?: string;
  [key: string]: any;
}

export interface DeleteWardrobeItemResponse {
  message?: string;
  [key: string]: any;
}

export interface WardrobeItem {
  id: string;
  type: string; // 'bottoms', 'upper_garments', 'shoes', 'accessories'
  subtype: string;
  color: string;
  climateFit: string | string[];
  brand?: string;
  imageUrl?: string;
  imageUrls?: string[];
  createdAt?: string;
  [key: string]: any;
}

export interface GetWardrobeItemsResponse {
  items?: WardrobeItem[];
  data?: WardrobeItem[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class WardrobeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Add a new item to the wardrobe
   * @param itemData The wardrobe item data
   * @returns Observable with the response
   */
  addItem(itemData: AddWardrobeItemRequest): Observable<AddWardrobeItemResponse> {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    formData.append('type', itemData.type);
    formData.append('subtype', itemData.subtype);
    formData.append('color', itemData.color);
    formData.append('climateFit', itemData.climatefit);
    
    if (itemData.brand) {
      formData.append('brand', itemData.brand);
    }
    
    // Handle image - convert base64 to File if needed
    if (typeof itemData.image === 'string') {
      // Convert base64 string to File
      const file = this.base64ToFile(itemData.image, 'image.jpg');
      formData.append('image', file);
    } else {
      // Already a File object
      formData.append('image', itemData.image);
    }
    
    // Get access token for validation
    const token = this.authService.getAccessToken();
    console.log('WardrobeService - token retrieved:', token ? 'Token exists' : 'Token is null/undefined');
    
    if (!token || token.trim() === '') {
      console.warn('WardrobeService - No access token available!');
      throw new Error('Access token is required to add wardrobe items');
    }
    
    // Let the interceptor handle adding the Authorization header
    // Don't manually set headers to avoid conflicts with the interceptor
    // The interceptor will automatically add the Authorization header to all requests
    console.log('WardrobeService - Making request, interceptor should add Authorization header');
    
    return this.http.post<AddWardrobeItemResponse>(
      `${environment.backendBaseUrl}/wardrobe`,
      formData
      // No headers option - let interceptor handle it
    );
  }

  /**
   * Get all wardrobe items
   * @param type Optional filter by type (e.g., 'bottoms', 'upper_garments', 'shoes', 'accessories')
   * @returns Observable with the wardrobe items
   */
  getItems(type?: string): Observable<WardrobeItem[]> {
    console.log('WardrobeService - Getting items', type ? `for type: ${type}` : 'all items');
    
    // Build URL - use /wardrobe/type endpoint when type is provided, otherwise /wardrobe for all items
    let url = `${environment.backendBaseUrl}/wardrobe`;
    if (type) {
      url = `${environment.backendBaseUrl}/wardrobe/type?type=${encodeURIComponent(type)}`;
    }
    
    // The interceptor will automatically add the Authorization header
    return this.http.get<GetWardrobeItemsResponse>(url).pipe(
      // Map the response to extract items array
      // Handle different possible response structures
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.items || response?.data || [];
      })
    );
  }

  /**
   * Update an existing wardrobe item
   * @param itemId The ID of the item to update
   * @param itemData The updated wardrobe item data
   * @returns Observable with the response
   */
  updateItem(itemId: string, itemData: UpdateWardrobeItemRequest): Observable<UpdateWardrobeItemResponse> {
    console.log('WardrobeService.updateItem called with itemId:', itemId, 'itemData:', itemData);
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    if (itemData.type) {
      formData.append('type', itemData.type);
    }
    if (itemData.subtype) {
      formData.append('subtype', itemData.subtype);
    }
    if (itemData.color) {
      formData.append('color', itemData.color);
    }
    if (itemData.climatefit) {
      formData.append('climateFit', itemData.climatefit);
    }
    if (itemData.brand !== undefined) {
      formData.append('brand', itemData.brand || '');
    }
    
    // Handle image - convert base64 to File if needed
    if (itemData.image) {
      if (typeof itemData.image === 'string') {
        // Convert base64 string to File
        const file = this.base64ToFile(itemData.image, 'image.jpg');
        formData.append('image', file);
      } else {
        // Already a File object
        formData.append('image', itemData.image);
      }
    }
    
    const url = `${environment.backendBaseUrl}/wardrobe/${itemId}`;
    console.log('WardrobeService.updateItem - Making PUT request to:', url);
    
    return this.http.put<UpdateWardrobeItemResponse>(url, formData);
  }

  /**
   * Delete a wardrobe item
   * @param itemId The ID of the item to delete
   * @returns Observable with the response
   */
  deleteItem(itemId: string): Observable<DeleteWardrobeItemResponse> {
    return this.http.delete<DeleteWardrobeItemResponse>(
      `${environment.backendBaseUrl}/wardrobe/${itemId}`
    );
  }

  /**
   * Get all bottoms items
   * @returns Observable with the bottoms items
   */
  getBottoms(): Observable<WardrobeItem[]> {
    return this.getItems('bottoms');
  }

  /**
   * Get all upper garments items
   * @returns Observable with the upper garments items
   */
  getUpperGarments(): Observable<WardrobeItem[]> {
    return this.getItems('upper_garments');
  }

  /**
   * Get all accessories items
   * @returns Observable with the accessories items
   */
  getAccessories(): Observable<WardrobeItem[]> {
    return this.getItems('accessories');
  }

  /**
   * Get all shoes items
   * @returns Observable with the shoes items
   */
  getShoes(): Observable<WardrobeItem[]> {
    return this.getItems('shoes');
  }

  /**
   * Convert base64 string to File object
   * @param base64String Base64 encoded image string
   * @param filename Name for the file
   * @returns File object
   */
  private base64ToFile(base64String: string, filename: string): File {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;
    
    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Determine MIME type from base64 string
    let mimeType = 'image/jpeg';
    if (base64String.includes('data:image/png')) {
      mimeType = 'image/png';
    } else if (base64String.includes('data:image/jpeg') || base64String.includes('data:image/jpg')) {
      mimeType = 'image/jpeg';
    } else if (base64String.includes('data:image/webp')) {
      mimeType = 'image/webp';
    }
    
    // Create Blob and then File
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  }
}

