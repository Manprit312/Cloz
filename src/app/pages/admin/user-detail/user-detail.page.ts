import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminService, AuthService } from '@app-core';
import type { AdminUserDetail } from '../../../core/services/admin.service';
import type { WardrobeItem } from '../../../core/services/wardrobe.service';
import type { Outfit } from '../../../core/services/outfits.service';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, AdminHeaderComponent, IonContent],
})
export class UserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  readonly user = signal<AdminUserDetail | null>(null);
  readonly wardrobe = signal<WardrobeItem[]>([]);
  readonly outfits = signal<Outfit[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly userId = computed(() => this.route.snapshot.paramMap.get('userId') ?? '');
  readonly displayTitle = computed(() => {
    const u = this.user();
    return u?.name ?? u?.username ?? u?.email ?? 'User';
  });

  readonly currentUserName = computed(
    () => this.authService.user()?.name ?? this.authService.user()?.username ?? ''
  );

  ngOnInit(): void {
    const id = this.userId();
    if (!id) {
      this.error.set('Invalid user');
      this.loading.set(false);
      return;
    }
    this.loadUser(id);
  }

  private loadUser(userId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getUserDetail(userId).subscribe({
      next: (u) => {
        this.user.set(u ?? null);
        this.loading.set(false);
        this.loadWardrobeAndOutfits(userId);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load user');
        this.loading.set(false);
      },
    });
  }

  private loadWardrobeAndOutfits(userId: string): void {
    this.adminService.getWardrobeForUser(userId).subscribe({
      next: (items) => this.wardrobe.set(items),
      error: () => this.wardrobe.set([]),
    });
    this.adminService.getOutfitsForUser(userId).subscribe({
      next: (list) => this.outfits.set(list),
      error: () => this.outfits.set([]),
    });
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  }
}
