import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '@models/user.model';
import { UserService } from './user.service';
import { Observable, map, catchError, of, shareReplay, finalize, from, switchMap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';
  private readonly TOKEN_STORAGE_KEY = 'accessToken';
  private readonly SESSION_ID_KEY = 'sessionId';
  private readonly EXPIRES_AT_STORAGE_KEY = 'accessTokenExpiresAt';
  private readonly _user = signal<User | null>(null);
  private readonly _accessToken = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  // IMPORTANT: Only check for user existence, not token validity
  // Token expiration doesn't mean user is logged out - token will be refreshed automatically
  readonly isLoggedIn = computed(() => !!this._user());
  readonly userRole = computed(() => this._user()?.role ?? null);
  private router = inject(Router);
  private userService = inject(UserService);

  /** Resolves when user (and token) have been loaded from storage. Guard should wait for this. */
  private readonly initPromise: Promise<void>;

  constructor() {
    this.initPromise = Promise.all([
      this.loadUserAsync(),
      this.loadTokenAsync(),
    ]).then(() => {});
  }

  /** Use in guards to avoid deciding before user is loaded from storage. */
  whenReady(): Promise<void> {
    return this.initPromise;
  }

  setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  /**
   * Set access token and expiration time
   * @param token The access token
   * @param expiresIn Optional expiration time in seconds (defaults to 300 seconds / 5 minutes)
   */
  async setAccessToken(token: string, expiresIn: number = 300): Promise<void> {
    await Preferences.set({ key: this.TOKEN_STORAGE_KEY, value: token });
    this._accessToken.set(token);
    
    // Calculate expiration time with 40 second buffer for safety (for 5 min expiry)
    const expiresAt = Date.now() + (expiresIn - 40) * 1000;
    await Preferences.set({ key: this.EXPIRES_AT_STORAGE_KEY, value: expiresAt.toString() });
  }

  /**
   * Set session ID
   * @param sessionId The session ID
   */
  async setSessionId(sessionId: string): Promise<void> {
    await Preferences.set({ key: this.SESSION_ID_KEY, value: sessionId });
  }


  getAccessToken(): string | null {
    return this._accessToken();
  }

  /**
   * Get token expiration time
   * @returns Promise resolving to expiration timestamp in milliseconds or null
   */
  private async getTokenExpiresAt(): Promise<number | null> {
    const expiresAt = await Preferences.get({ key: this.EXPIRES_AT_STORAGE_KEY });
    return expiresAt.value ? parseInt(expiresAt.value, 10) : null;
  }

  /**
   * Check if current token is still valid
   * @returns Promise resolving to true if token exists and hasn't expired
   */
  async isTokenValid(): Promise<boolean> {
    const token = this.getAccessToken();
    const expiresAt = await this.getTokenExpiresAt();
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return Date.now() < expiresAt;
  }

  /**
   * Check if token needs to be refreshed (expired or about to expire soon)
   * @param bufferSeconds Buffer time in seconds before expiration to trigger refresh (default: 40 seconds for 5 min expiry)
   * @returns Promise resolving to true if token should be refreshed
   */
  async shouldRefreshToken(bufferSeconds: number = 40): Promise<boolean> {
    const expiresAt = await this.getTokenExpiresAt();
    
    if (!expiresAt) {
      return false; // No expiration time stored, can't determine
    }
    
    const now = Date.now();
    const bufferMs = bufferSeconds * 1000;
    
    // Refresh if token has expired or will expire within the buffer time
    return now >= (expiresAt - bufferMs);
  }

  /**
   * Logout user - calls logout API and clears all data
   */
  async logout(): Promise<void> {
    try {
      const session = await Preferences.get({ key: this.SESSION_ID_KEY });
      const sessionId = session.value;

      if (sessionId) {
        await fetch(`${environment.backendBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': sessionId,
          },
        });
      }
    } catch (err) {
      console.error('AuthService - Logout API failed:', err);
    } finally {
      await this.clearAllData();
      this.router.navigateByUrl('/login');
    }
  }

  /**
   * Clear all local storage and reset state (used on logout).
   * Clears localStorage, sessionStorage, Capacitor Preferences, and in-memory signals.
   */
  private async clearAllData(): Promise<void> {
    await Preferences.clear();
    localStorage.clear();
    sessionStorage.clear();
    this._user.set(null);
    this._accessToken.set(null);
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const currentRole = this.userRole();
    return !!currentRole && allowedRoles.includes(currentRole);
  }

  private refreshPromise: Observable<boolean> | null = null;

  /**
   * Refresh the access token using the session ID from Capacitor Preferences
   * Sends sessionId in X-Session-Id header instead of relying on cookies
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
    console.log('AuthService - refreshAccessToken: Using X-Session-Id header from Capacitor Preferences');

    // Call /auth/refresh using sessionId from Preferences
    this.refreshPromise = from(Preferences.get({ key: this.SESSION_ID_KEY })).pipe(
      switchMap((session) => {
        const sessionId = session.value;
        
        if (!sessionId) {
          console.error('AuthService - refreshAccessToken: Session not found on device');
          // Check if user data exists (user was logged in before)
          const user = this._user();
          if (user) {
            console.log('AuthService - refreshAccessToken: User data exists but sessionId missing - session may have expired, redirecting to login');
            // User was logged in before but sessionId is missing - can't refresh without sessionId
            // Clear data and redirect to login
            return from(this.clearAllData()).pipe(
              switchMap(() => {
                const currentUrl = this.router.url;
                if (!currentUrl.includes('/login') && !currentUrl.includes('/onboarding') && 
                    !currentUrl.includes('/signup') && !currentUrl.includes('/verification')) {
                  console.log('AuthService - refreshAccessToken: Redirecting to login - session not found but user was logged in');
                  this.router.navigateByUrl('/login');
                }
                return of(false);
              })
            );
          } else {
            // No user data and no sessionId - user was never logged in or data was cleared
            console.log('AuthService - refreshAccessToken: No sessionId and no user data - user not logged in');
            return of(false);
          }
        }

        return this.userService.refreshToken(sessionId).pipe(
          switchMap(async (response) => {
            // Get the new access token from response
            const newAccessToken = response?.accessToken || response?.token;
            const expiresIn = response?.expiresIn || 300; // Default to 5 minutes

            if (newAccessToken) {
              // Replace the current access token with the new one
              await this.setAccessToken(newAccessToken, expiresIn);
              // Keep sessionId (it doesn't change, but ensure it's still saved)
              await Preferences.set({ key: this.SESSION_ID_KEY, value: sessionId });
              console.log('AuthService - refreshAccessToken: Access token refreshed successfully');
              return true;
            }

            console.warn('AuthService - refreshAccessToken: No access token in refresh response');
            return false;
          })
        );
      }),
      catchError((err) => {
        console.error('AuthService - refreshAccessToken: Refresh API call failed:', err);
        console.error('AuthService - refreshAccessToken: Error status:', err?.status);
        console.error('AuthService - refreshAccessToken: Error message:', err?.error?.message || err?.message);
        console.error('AuthService - refreshAccessToken: Full error response:', err?.error);
        
        // Only clear data if session/refresh token is invalid (401 or 403 from refresh endpoint)
        // Also handle 400 "Invalid or expired session" - this means session doesn't exist in backend
        // IMPORTANT: Don't clear data for network errors or temporary failures
        if (err.status === 401 || err.status === 403 || 
            (err.status === 400 && err?.error?.message?.toLowerCase().includes('invalid') && 
             err?.error?.message?.toLowerCase().includes('session'))) {
          console.error('AuthService - refreshAccessToken: Session/refresh token is invalid/expired, clearing session');
          // Only clear if we're sure the session is invalid
          // Clear data and redirect to login
          return from(this.clearAllData()).pipe(
            switchMap(() => {
              // Redirect to login if not already on login/onboarding pages
              const currentUrl = this.router.url;
              if (!currentUrl.includes('/login') && !currentUrl.includes('/onboarding') && 
                  !currentUrl.includes('/signup') && !currentUrl.includes('/verification')) {
                console.log('AuthService - refreshAccessToken: Redirecting to login after session expiration');
                this.router.navigateByUrl('/login');
              }
              return of(false);
            })
          );
        } else {
          // For other errors (network issues, 500, etc.), don't clear data
          // The session might still be valid, just the refresh call failed
          console.warn('AuthService - refreshAccessToken: Refresh failed but session may still be valid, not clearing data');
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

  private async loadUserAsync(): Promise<void> {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) {
        this._user.set(null);
        return;
      }
      // Normalize role: backend may use different keys/casing or roles array (e.g. Keycloak ['ROLE_ADMIN'])
      const roleRaw =
        parsed.role ??
        parsed.userRole ??
        parsed.authority ??
        (Array.isArray(parsed.roles) && parsed.roles.length > 0
          ? parsed.roles[0]
          : 'user');
      const roleStr = String(roleRaw).toLowerCase().replace(/^role_/, '');
      const role: UserRole = roleStr === 'admin' ? 'admin' : 'user';
      this._user.set({ ...parsed, role });
    } catch {
      this._user.set(null);
    }
  }

  private async loadTokenAsync(): Promise<void> {
    try {
      const tokenResult = await Preferences.get({ key: this.TOKEN_STORAGE_KEY });
      const token = tokenResult.value;
      
      // IMPORTANT: Do NOT clear expired tokens here.
      // Even if the token is expired, the user should still be considered logged in
      // if user data exists. The token will be refreshed automatically by the interceptor
      // when the next API call is made. Clearing it here would log out the user unnecessarily.
      
      this._accessToken.set(token);
    } catch {
      this._accessToken.set(null);
    }
  }

  /**
   * Check if session is still valid by attempting to refresh the token
   * This is useful when app resumes after being in background
   * If accessToken is missing or session is invalid, user will be logged out and redirected to login
   * @returns Promise resolving to true if session appears valid, false otherwise
   */
  async validateSessionOnResume(): Promise<boolean> {
    // Check if user exists and session ID exists
    const user = this._user();
    const sessionIdResult = await Preferences.get({ key: this.SESSION_ID_KEY });
    const sessionId = sessionIdResult.value;
    
    if (!user || !sessionId) {
      console.log('AuthService - validateSessionOnResume: No user or session ID found, logging out');
      // Clear any remaining data and redirect to login
      await this.clearAllData();
      this.router.navigateByUrl('/login');
      return false;
    }

    // Check if accessToken exists
    const token = this.getAccessToken();
    
    // If no token at all, try to refresh using sessionId
    if (!token) {
      console.log('AuthService - validateSessionOnResume: No accessToken found, attempting to refresh using sessionId');
      return new Promise((resolve) => {
        this.refreshAccessToken().subscribe({
          next: (success) => {
            if (success) {
              console.log('AuthService - validateSessionOnResume: Token refreshed successfully');
              resolve(true);
            } else {
              console.log('AuthService - validateSessionOnResume: Token refresh failed, logging out');
              // Refresh failed - session is invalid, logout and redirect
              this.logout().then(() => resolve(false));
            }
          },
          error: (err) => {
            console.error('AuthService - validateSessionOnResume: Token refresh error:', err);
            // Check if it's a session invalidation error
            const isSessionInvalid = err?.status === 401 || err?.status === 403 || 
              (err?.status === 400 && err?.error?.message?.toLowerCase().includes('invalid') && 
               err?.error?.message?.toLowerCase().includes('session'));
            
            if (isSessionInvalid) {
              console.log('AuthService - validateSessionOnResume: Session is invalid, logging out');
              // Session invalid - logout and redirect
              this.logout().then(() => resolve(false));
            } else {
              // Network error or other temporary issue - keep session for now
              console.warn('AuthService - validateSessionOnResume: Refresh failed but may be temporary, keeping session');
              resolve(true);
            }
          }
        });
      });
    }

    // Token exists - check if it needs to be refreshed
    const shouldRefresh = await this.shouldRefreshToken();
    
    if (shouldRefresh) {
      console.log('AuthService - validateSessionOnResume: Token expired, attempting refresh');
      return new Promise((resolve) => {
        this.refreshAccessToken().subscribe({
          next: (success) => {
            if (success) {
              console.log('AuthService - validateSessionOnResume: Token refreshed successfully');
              resolve(true);
            } else {
              console.log('AuthService - validateSessionOnResume: Token refresh failed, logging out');
              // Refresh failed - session is invalid, logout and redirect
              this.logout().then(() => resolve(false));
            }
          },
          error: (err) => {
            console.error('AuthService - validateSessionOnResume: Token refresh error:', err);
            // Check if it's a session invalidation error
            const isSessionInvalid = err?.status === 401 || err?.status === 403 || 
              (err?.status === 400 && err?.error?.message?.toLowerCase().includes('invalid') && 
               err?.error?.message?.toLowerCase().includes('session'));
            
            if (isSessionInvalid) {
              console.log('AuthService - validateSessionOnResume: Session is invalid, logging out');
              // Session invalid - logout and redirect
              this.logout().then(() => resolve(false));
            } else {
              // Network error or other temporary issue - keep session for now
              console.warn('AuthService - validateSessionOnResume: Refresh failed but may be temporary, keeping session');
              resolve(true);
            }
          }
        });
      });
    }

    // Token exists and is still valid
    console.log('AuthService - validateSessionOnResume: Token still valid');
    return true;
  }

}
