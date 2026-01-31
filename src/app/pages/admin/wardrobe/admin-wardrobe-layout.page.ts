import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonContent, IonRouterOutlet } from '@ionic/angular/standalone';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService, AdminService } from '@app-core';
import { AdminWardrobeContextService } from '../../../core/services/admin-wardrobe-context.service';

@Component({
  selector: 'app-admin-wardrobe-layout',
  templateUrl: './admin-wardrobe-layout.page.html',
  styleUrls: ['./admin-wardrobe-layout.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent, IonRouterOutlet, AdminHeaderComponent, IconComponent],
})
export class AdminWardrobeLayoutPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private context = inject(AdminWardrobeContextService);

  readonly userId = signal<string | null>(null);
  readonly userName = signal<string>('');

  readonly currentUserName = computed(
    () => this.authService.user()?.name ?? this.authService.user()?.username ?? ''
  );

  readonly adminInitials = computed(() => {
    const n = this.currentUserName();
    if (!n?.trim()) return '';
    const words = String(n).trim().split(/\s+/);
    const first = words[0]?.[0] ?? '';
    const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : (words[0]?.[1] ?? '');
    return (first + last).toUpperCase();
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('userId');
    this.userId.set(id);
    this.context.setUserId(id);
    if (id) {
      this.adminService.getUserDetail(id).subscribe({
        next: (u) => this.userName.set(u?.name ?? u?.['name'] ?? u?.email ?? 'User'),
        error: () => this.userName.set('User'),
      });
    } else {
      this.userName.set('User');
    }
  }

  ngOnDestroy(): void {
    this.context.setUserId(null);
  }
}
