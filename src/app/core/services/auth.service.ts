import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '@models/user.model';
import { UserService } from './user.service';
import { Observable, map, catchError, of, shareReplay, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';
  private readonly TOKEN_STORAGE_KEY = 'accessToken';
  private readonly EXPIRES_AT_STORAGE_KEY = 'accessTokenExpiresAt';
  private readonly _user = signal<User | null>(this.loadUser());
  private readonly _accessToken = signal<string | null>(this.loadToken());

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  // IMPORTANT: Only check for user existence, not token validity
  // Token expiration doesn't mean user is logged out - token will be refreshed automatically
  readonly isLoggedIn = computed(() => !!this._user());
  readonly userRole = computed(() => this._user()?.role ?? null);
  private router = inject(Router);
  private userService = inject(UserService);

  setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  /**
   * Set access token and expiration time
   * @param token The access token
   * @param expiresIn Optional expiration time in seconds (defaults to 900 seconds / 15 minutes)
   */
  setAccessToken(token: string, expiresIn: number = 900): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    this._accessToken.set(token);
    
    // Calculate expiration time with 60 second buffer for safety
    const expiresAt = Date.now() + (expiresIn - 60) * 1000;
    localStorage.setItem(this.EXPIRES_AT_STORAGE_KEY, expiresAt.toString());
  }


  getAccessToken(): string | null {
    return this._accessToken();
  }

  /**
   * Get token expiration time
   * @returns Expiration timestamp in milliseconds or null
   */
  private getTokenExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_STORAGE_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  /**
   * Check if current token is still valid
   * @returns true if token exists and hasn't expired
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    const expiresAt = this.getTokenExpiresAt();
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return Date.now() < expiresAt;
  }

  /**
   * Check if token needs to be refreshed (expired or about to expire soon)
   * @param bufferSeconds Buffer time in seconds before expiration to trigger refresh (default: 60 seconds)
   * @returns true if token should be refreshed
   */
  shouldRefreshToken(bufferSeconds: number = 60): boolean {
    const expiresAt = this.getTokenExpiresAt();
    
    if (!expiresAt) {
      return false; // No expiration time stored, can't determine
    }
    
    const now = Date.now();
    const bufferMs = bufferSeconds * 1000;
    
    // Refresh if token has expired or will expire within the buffer time
    return now >= (expiresAt - bufferMs);
  }

  /**
   * Logout user - calls logout API and clears all localStorage
   */
  logout(): void {
    this.userService.logout().subscribe({
        next: () => {
          console.log('AuthService - Logout API call successful');
          this.clearAllData();
        },
        error: (err) => {
          console.error('AuthService - Logout API call failed:', err);
          // Even if API call fails, clear local data
          this.clearAllData();
        }
      });
  }

  /**
   * Clear all localStorage and reset state
   */
  private clearAllData(): void {
    // Clear token-related items
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.EXPIRES_AT_STORAGE_KEY);
    
    // Clear all localStorage items
    localStorage.clear();
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    // Reset signals
    this._user.set(null);
    this._accessToken.set(null);
    
    // Navigate to login
    this.router.navigateByUrl('/login');
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const currentRole = this.userRole();
    return !!currentRole && allowedRoles.includes(currentRole);
  }

  private refreshPromise: Observable<boolean> | null = null;

  /**
   * Refresh the access token using the session cookie
   * The backend manages refresh tokens server-side, linked to the session ID cookie
   * The session cookie is automatically sent with withCredentials: true
   * Uses a promise pattern to prevent multiple simultaneous refresh calls
   * 
   * IMPORTANT: This method does NOT log out users or clear data unless the session is invalid.
   * User will only be logged out if the session/refresh token is invalid/expired (401/403 from backend).
   * 
   * @returns Observable that emits true if refresh was successful, false otherwise
   */
  refreshAccessToken(): Observable<boolean> {
    // If a refresh is already in progress, return that observable
    // This prevents multiple simultaneous refresh API calls
    if (this.refreshPromise) {
      console.log('AuthService - refreshAccessToken: Refresh already in progress, returning existing observable');
      return this.refreshPromise;
    }

    console.log('AuthService - refreshAccessToken: Calling /auth/refresh endpoint');
    console.log('AuthService - refreshAccessToken: Session cookie will be sent automatically by browser');

    // Call /auth/refresh - backend uses session cookie to identify session and refresh token
    // No refreshToken needed in request body - session cookie is sufficient
    // Use shareReplay(1) to ensure the API call is only made once, even if multiple subscribers exist
    this.refreshPromise = this.userService.refreshToken().pipe(
      map((response) => {
        // Get the new access token from response
        const newAccessToken = response?.accessToken || response?.token;
        const expiresIn = response?.expiresIn || 900;

        if (newAccessToken) {
          // Replace the current access token with the new one
          this.setAccessToken(newAccessToken, expiresIn);
          console.log('AuthService - refreshAccessToken: Access token refreshed successfully');
          return true;
        }

        console.warn('AuthService - refreshAccessToken: No access token in refresh response');
        return false;
      }),
      catchError((err) => {
        console.error('AuthService - refreshAccessToken: Refresh API call failed:', err);
        console.error('AuthService - refreshAccessToken: Error status:', err?.status);
        console.error('AuthService - refreshAccessToken: Error message:', err?.error?.message || err?.message);
        console.error('AuthService - refreshAccessToken: Full error response:', err?.error);
        
        // Only clear data if session/refresh token is invalid (401 or 403 from refresh endpoint)
        // Also handle 400 "Invalid or expired session" - this means session doesn't exist in backend
        if (err.status === 401 || err.status === 403 || 
            (err.status === 400 && err?.error?.message?.toLowerCase().includes('invalid') && 
             err?.error?.message?.toLowerCase().includes('session'))) {
          console.error('AuthService - refreshAccessToken: Session/refresh token is invalid/expired, clearing session');
          console.error('AuthService - refreshAccessToken: This could mean:');
          console.error('  1. Session was not saved to database properly');
          console.error('  2. Session expired immediately');
          console.error('  3. Session lookup is failing in backend');
          console.error('  4. Database/storage connection issue');
          this.clearAllData();
        }
        
        return of(false);
      }),
      // Use shareReplay(1) to ensure the API call executes only once and the result is shared
      // This prevents multiple simultaneous refresh API calls when multiple requests trigger refresh
      shareReplay(1),
      // Clear the refreshPromise after the observable completes (success or error)
      // This allows future refresh attempts to proceed
      finalize(() => {
        console.log('AuthService - refreshAccessToken: Observable completed, clearing refreshPromise');
        this.refreshPromise = null;
      })
    );

    return this.refreshPromise;
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private loadToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    
    // IMPORTANT: Do NOT clear expired tokens here.
    // Even if the token is expired, the user should still be considered logged in
    // if user data exists. The token will be refreshed automatically by the interceptor
    // when the next API call is made. Clearing it here would log out the user unnecessarily.
    
    return token;
  }

}
