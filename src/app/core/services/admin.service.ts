import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { WardrobeItem } from './wardrobe.service';
import type { Outfit } from './outfits.service';

/** User row in admin users list (GET /admin/users) */
export interface AdminUserListItem {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  garmentsCount?: number;
  outfitsCount?: number;
  signUpDate?: string;
  lastLogin?: string;
  [key: string]: any;
}

export interface AdminUsersListResponse {
  users?: AdminUserListItem[];
  data?: AdminUserListItem[];
  [key: string]: any;
}

/** User detail for admin (GET /admin/users/:userId) */
export interface AdminUserDetail {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  signUpDate?: string;
  lastLogin?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  /**
   * List all users (admin). GET {{baseurl}}/admin/users
   */
  getUsers(): Observable<AdminUserListItem[]> {
    const url = `${environment.backendBaseUrl}/admin/users`;
    return this.http.get<unknown>(url).pipe(
      map((res) => {
        let list: Record<string, unknown>[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === 'object') {
          const obj = res as Record<string, unknown>;
          const raw = obj['users'] ?? obj['data'] ?? obj['result'] ?? obj['items'] ?? [];
          list = Array.isArray(raw) ? raw : [];
        }
        // Map API shape (userId, wardrobeItemCount, outfitCount, createdAt, lastLoginDate)
        // to AdminUserListItem (id, garmentsCount, outfitsCount, signUpDate, lastLogin)
        return list.map((u) => {
          const item = u as Record<string, unknown>;
          return {
            id: String(item['id'] ?? item['userId'] ?? ''),
            name: item['name'],
            email: item['email'],
            username: item['username'],
            garmentsCount: item['garmentsCount'] ?? item['wardrobeItemCount'],
            outfitsCount: item['outfitsCount'] ?? item['outfitCount'],
            signUpDate: item['signUpDate'] ?? item['createdAt'],
            lastLogin: item['lastLogin'] ?? item['lastLoginDate'],
          } as AdminUserListItem;
        });
      })
    );
  }

  /**
   * Get one user detail (admin). GET {{baseurl}}/admin/users/:userId
   */
  getUserDetail(userId: string): Observable<AdminUserDetail | null> {
    const url = `${environment.backendBaseUrl}/admin/users/${encodeURIComponent(userId)}`;
    return this.http.get<AdminUserDetail>(url).pipe(
      map((res) => res ?? null)
    );
  }

  /**
   * Get wardrobe for a user (admin). GET {{baseurl}}/admin/wardrobe/:userId
   */
  getAdminWardrobe(userId: string): Observable<WardrobeItem[]> {
    const url = `${environment.backendBaseUrl}/admin/wardrobe/${encodeURIComponent(userId)}`;
    return this.http.get<unknown>(url).pipe(
      map((res) => {
        if (Array.isArray(res)) return res as WardrobeItem[];
        if (res && typeof res === 'object') {
          const obj = res as Record<string, unknown>;
          const items = obj['items'] ?? obj['data'] ?? obj['wardrobe'] ?? [];
          return Array.isArray(items) ? items : [];
        }
        return [];
      })
    );
  }

  /**
   * @deprecated Use getAdminWardrobe. Get wardrobe for a user (admin). GET {{baseurl}}/admin/users/:userId/wardrobe
   */
  getWardrobeForUser(userId: string): Observable<WardrobeItem[]> {
    return this.getAdminWardrobe(userId);
  }

  /**
   * Get outfits for a user (admin). GET {{baseurl}}/admin/users/:userId/outfits
   */
  getOutfitsForUser(userId: string): Observable<Outfit[]> {
    const url = `${environment.backendBaseUrl}/admin/users/${encodeURIComponent(userId)}/outfits`;
    return this.http.get<{ outfits?: Outfit[]; data?: Outfit[] }>(url).pipe(
      map((res) => {
        const list = res?.outfits ?? res?.data ?? [];
        return Array.isArray(list) ? list : [];
      })
    );
  }
}
