import { Injectable, signal, computed } from '@angular/core';

/** When set, the app is in "admin viewing user's wardrobe" mode. Cleared when leaving admin wardrobe. */
@Injectable({ providedIn: 'root' })
export class AdminWardrobeContextService {
  readonly userId = signal<string | null>(null);
  readonly isAdminMode = computed(() => !!this.userId());

  setUserId(id: string | null): void {
    this.userId.set(id);
  }
}
