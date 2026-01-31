import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, Gender } from '@models/user.model';
import { AuthService } from './auth.service';
import type { GetProfileResponse } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly PROFILE_STORAGE_KEY = 'userProfile';

  private readonly _profile = signal<UserProfile>(this.loadProfile());
  readonly profile = this._profile.asReadonly();
  readonly darkMode = computed(() => this._profile().darkMode);

  constructor(private authService: AuthService) {
    // Initialize profile from user data if available
    this.syncFromAuthService();
    // Apply theme on init so iOS simulator/device matches stored or system preference
    this.applyDarkMode();
  }

  /**
   * Set profile from GET /user/profile API response. Used after verify.
   * Same data is used for currentUser (AuthService) and userProfile (this service).
   */
  setProfileFromApi(data: GetProfileResponse): void {
    const gender = this.normalizeGender(data.gender);
    this._profile.update(() => ({
      name: data.name ?? 'User',
      email: data.email ?? '',
      gender,
      darkMode: data.darkMode ?? this._profile().darkMode,
    }));
    this.saveProfile();
  }

  /**
   * Sync profile from currentUser (e.g. on app init when no profile API was called yet).
   */
  syncFromAuthService(): void {
    const user = this.authService.user();
    if (user) {
      this._profile.update((p) => ({
        ...p,
        email: user.email ?? p.email ?? '',
        name: user.name ?? user.username ?? p.name ?? 'User',
        gender: user.gender ?? p.gender,
      }));
      this.saveProfile();
    }
  }

  private normalizeGender(value: string | undefined): Gender {
    if (value === 'Male' || value === 'Female') return value;
    return value?.toLowerCase() === 'male' ? 'Male' : 'Female';
  }

  updateName(name: string): void {
    this._profile.update((p) => ({ ...p, name }));
    this.saveProfile();
  }

  updateEmail(email: string): void {
    this._profile.update((p) => ({ ...p, email }));
    this.saveProfile();
  }

  updateGender(gender: Gender): void {
    this._profile.update((p) => ({ ...p, gender }));
    this.saveProfile();
  }

  toggleDarkMode(): void {
    this._profile.update((p) => ({ ...p, darkMode: !p.darkMode }));
    this.saveProfile();
    this.applyDarkMode();
  }

  setDarkMode(enabled: boolean): void {
    this._profile.update((p) => ({ ...p, darkMode: enabled }));
    this.saveProfile();
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    const isDark = this._profile().darkMode;
    document.body.classList.toggle('dark', isDark);
  }

  private loadProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (raw) {
        const profile = JSON.parse(raw);
        return profile;
      }
    } catch {
      // Ignore errors
    }

    // Default profile: follow system appearance so iOS light/dark works out of the box
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      name: 'Luisa Monsalve',
      email: 'luisa@zerena.nl',
      gender: 'Female',
      darkMode: prefersDark,
    };
  }

  private saveProfile(): void {
    try {
      localStorage.setItem(
        this.PROFILE_STORAGE_KEY,
        JSON.stringify(this._profile())
      );
    } catch {
      // Ignore errors
    }
  }
}

