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
    // Backend expects 'images' (plural) field name, not 'image'
    if (typeof itemData.image === 'string') {
      // Convert base64 string to File
      const file = this.base64ToFile(itemData.image, 'image.jpg');
      formData.append('images', file);
    } else {
      // Already a File object
      formData.append('images', itemData.image);
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
        let items: any[] = [];
        if (Array.isArray(response)) {
          items = response;
        } else {
          items = response?.items || response?.data || [];
        }
        
        // Transform backend format to frontend format
        // Backend returns: { images: [{ imageUrl: "..." }, ...] }
        // Frontend expects: { imageUrl: "...", imageUrls: ["...", ...] }
        return items.map((item) => this.transformWardrobeItem(item));
      })
    );
  }

  /**
   * Transform backend wardrobe item format to frontend format
   * Backend returns: { images: [{ imageUrl: string, isPrimary: boolean, ... }] }
   * Frontend expects: { imageUrl: string, imageUrls: string[] }
   */
  private transformWardrobeItem(item: any): WardrobeItem {
    // Extract image URLs from the images array
    const imageUrls: string[] = [];
    if (item.images && Array.isArray(item.images)) {
      // Sort by displayOrder or isPrimary to maintain order
      const sortedImages = [...item.images].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      imageUrls.push(...sortedImages.map((img: any) => img.imageUrl || img.url).filter(Boolean));
    }
    
    // Set primary imageUrl (first image or existing imageUrl)
    const imageUrl = imageUrls.length > 0 ? imageUrls[0] : item.imageUrl || '';
    
    return {
      ...item,
      imageUrl,
      imageUrls: imageUrls.length > 0 ? imageUrls : (item.imageUrls || (item.imageUrl ? [item.imageUrl] : undefined)),
      // Remove the images array to avoid confusion
      images: undefined,
    };
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
    // Backend expects 'images' (plural) field name, not 'image'
    if (itemData.image) {
      if (typeof itemData.image === 'string') {
        // Convert base64 string to File
        const file = this.base64ToFile(itemData.image, 'image.jpg');
        formData.append('images', file);
      } else {
        // Already a File object
        formData.append('images', itemData.image);
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
   * Set/save a temporary image as a permanent wardrobe image
   * @param itemId The ID of the item to update
   * @param imageUrl The URL of the temporary image to save as permanent
   * @returns Observable with the updated wardrobe item
   */
  setGarmentImage(itemId: string, imageUrl: string): Observable<any> {
    const url = `${environment.backendBaseUrl}/wardrobe/setGarmentImage/${itemId}`;
    const body = { imageUrl };
    
    // Get access token for validation
    const token = this.authService.getAccessToken();
    console.log('WardrobeService.setGarmentImage - token retrieved:', token ? 'Token exists' : 'Token is null/undefined');
    
    if (!token || token.trim() === '') {
      console.warn('WardrobeService.setGarmentImage - No access token available!');
      throw new Error('Access token is required to set garment image');
    }
    
    console.log('WardrobeService.setGarmentImage - Making POST request to:', url);
    console.log('WardrobeService.setGarmentImage - Request body:', body);
    
    // Let the interceptor handle adding the Authorization header
    console.log('WardrobeService.setGarmentImage - Making request, interceptor should add Authorization header');
    
    return this.http.post<any>(url, body);
  }

  /**
   * Cleanup/process an item image using AI
   * @param itemId The ID of the item to cleanup
   * @param imageUrl The URL of the image to cleanup
   * @returns Observable with the cleanup response (should contain cleaned image URL)
   */
  cleanupItem(itemId: string, imageUrl: string): Observable<any> {
    const url = `${environment.backendBaseUrl}/wardrobe/cleanup/${itemId}`;
    const body = { imageUrl };
    
    // Get access token for validation
    const token = this.authService.getAccessToken();
    console.log('WardrobeService.cleanupItem - token retrieved:', token ? 'Token exists' : 'Token is null/undefined');
    
    if (!token || token.trim() === '') {
      console.warn('WardrobeService.cleanupItem - No access token available!');
      throw new Error('Access token is required to cleanup wardrobe items');
    }
    
    console.log('WardrobeService.cleanupItem - Making POST request to:', url);
    console.log('WardrobeService.cleanupItem - Request body:', body);
    
    // Let the interceptor handle adding the Authorization header
    // Don't manually set headers to avoid conflicts with the interceptor
    // The interceptor will automatically add the Authorization header to all requests
    console.log('WardrobeService.cleanupItem - Making request, interceptor should add Authorization header');
    
    return this.http.post<any>(url, body);
  }

  /**
   * Cancel/delete a temporary garment image that was generated by AI cleanup
   * @param imageUrl The URL of the temporary image to cancel/delete
   * @returns Observable with the cancellation response
   */
  cancelGarmentImage(imageUrl: string): Observable<any> {
    const url = `${environment.backendBaseUrl}/wardrobe/cancelGarmentImage`;
    const body = { imageUrl };
    
    // Get access token for validation
    const token = this.authService.getAccessToken();
    console.log('WardrobeService.cancelGarmentImage - token retrieved:', token ? 'Token exists' : 'Token is null/undefined');
    
    if (!token || token.trim() === '') {
      console.warn('WardrobeService.cancelGarmentImage - No access token available!');
      throw new Error('Access token is required to cancel garment image');
    }
    
    console.log('WardrobeService.cancelGarmentImage - Making POST request to:', url);
    console.log('WardrobeService.cancelGarmentImage - Request body:', body);
    
    // Let the interceptor handle adding the Authorization header
    console.log('WardrobeService.cancelGarmentImage - Making request, interceptor should add Authorization header');
    
    return this.http.post<any>(url, body);
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

