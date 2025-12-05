import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, Gender } from '@models/user.model';
import { AuthService } from './auth.service';

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
    const user = this.authService.user();
    if (user && !this._profile().email) {
      this._profile.update((p) => ({
        ...p,
        name: user.name || p.name || 'Luisa Monsalve',
        email: user.email || p.email || 'luisa@zerena.nl',
        gender: user.gender || p.gender || 'Female',
      }));
      this.saveProfile();
    }
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
        // Apply dark mode on load
        if (profile.darkMode) {
          document.body.classList.add('dark');
        }
        return profile;
      }
    } catch {
      // Ignore errors
    }

    // Default profile
    return {
      name: 'Luisa Monsalve',
      email: 'luisa@zerena.nl',
      gender: 'Female',
      darkMode: false,
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

