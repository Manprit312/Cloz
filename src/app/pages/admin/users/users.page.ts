import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonLoading,
  IonSearchbar,
  IonButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { AdminService } from '@app-core';
import type { AdminUserListItem } from '../../../core/services/admin.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    IonLoading,
    IonSearchbar,
    IonButton,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule,
    RouterLink,
    IconComponent,
  ],
})
export class UsersPage implements OnInit {
  private adminService = inject(AdminService);

  readonly users = signal<AdminUserListItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly sortColumn = signal<'user' | 'garments' | 'outfits' | 'signupdate' | 'lastlogin' | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  readonly filteredUsers = computed(() => {
    let list = this.users();
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const name = (u.name ?? u['name'] ?? '').toString().toLowerCase();
        const email = (u.email ?? u['email'] ?? '').toString().toLowerCase();
        const username = (u.username ?? u['username'] ?? '').toString().toLowerCase();
        return name.includes(q) || email.includes(q) || username.includes(q);
      });
    }
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (col === 'user') {
        const na = (this.displayName(a) ?? '').toLowerCase();
        const nb = (this.displayName(b) ?? '').toLowerCase();
        cmp = na.localeCompare(nb);
      } else if (col === 'garments') {
        const va = a.garmentsCount ?? a['garmentsCount'] ?? 0;
        const vb = b.garmentsCount ?? b['garmentsCount'] ?? 0;
        cmp = (va as number) - (vb as number);
      } else if (col === 'outfits') {
        const va = a.outfitsCount ?? a['outfitsCount'] ?? 0;
        const vb = b.outfitsCount ?? b['outfitsCount'] ?? 0;
        cmp = (va as number) - (vb as number);
      } else if (col === 'signupdate') {
        const da = a.signUpDate ?? a['signUpDate'] ?? a['createdAt'] ?? '';
        const db = b.signUpDate ?? b['signUpDate'] ?? b['createdAt'] ?? '';
        cmp = String(da).localeCompare(String(db));
      } else if (col === 'lastlogin') {
        const da = a.lastLogin ?? a['lastLogin'] ?? a['lastLoginDate'] ?? '';
        const db = b.lastLogin ?? b['lastLogin'] ?? b['lastLoginDate'] ?? '';
        cmp = String(da).localeCompare(String(db));
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  constructor() {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load users');
        this.loading.set(false);
        this.users.set([]);
      },
    });
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  onSearchChange(event: Event): void {
    const ev = event as CustomEvent<{ value?: string }>;
    this.searchQuery.set(ev.detail?.value ?? '');
  }

  onSortClick(column: 'user' | 'garments' | 'outfits' | 'signupdate' | 'lastlogin'): void {
    const current = this.sortColumn();
    const dir = this.sortDirection();
    if (current === column) {
      this.sortDirection.set(dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: 'user' | 'garments' | 'outfits' | 'signupdate' | 'lastlogin'): 'tailless-arrow-up' | 'tailless-arrow-down' | 'tailless-arrow-expand' {
    if (this.sortColumn() !== column) return 'tailless-arrow-expand';
    return this.sortDirection() === 'asc' ? 'tailless-arrow-up' : 'tailless-arrow-down';
  }

  getSortIconColor(column: 'user' | 'garments' | 'outfits' | 'signupdate' | 'lastlogin'): string {
    return this.sortColumn() === column ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)';
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  displayName(user: AdminUserListItem): string {
    return (user.name ?? user['name'] ?? user.username ?? user.email ?? '—') as string;
  }
}
