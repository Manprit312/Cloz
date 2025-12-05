import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '@models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';
  private readonly _user = signal<User | null>(this.loadUser());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly userRole = computed(() => this._user()?.role ?? null);
  private router = inject(Router);

  setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const currentRole = this.userRole();
    return !!currentRole && allowedRoles.includes(currentRole);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
