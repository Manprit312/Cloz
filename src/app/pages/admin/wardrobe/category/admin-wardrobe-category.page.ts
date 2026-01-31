import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AdminService } from '@app-core';
import type { WardrobeItem } from '../../../../core/services/wardrobe.service';
import { AdminWardrobeContextService } from '../../../../core/services/admin-wardrobe-context.service';

const TYPE_LABELS: Record<string, string> = {
  upper_garments: 'Upper garments',
  bottoms: 'Bottoms',
  shoes: 'Shoes',
  accessories: 'Accessories',
};

@Component({
  selector: 'app-admin-wardrobe-category',
  templateUrl: './admin-wardrobe-category.page.html',
  styleUrls: ['./admin-wardrobe-category.page.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel],
})
export class AdminWardrobeCategoryPage implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private adminContext = inject(AdminWardrobeContextService);

  readonly userId = computed(() => String(this.adminContext.userId() ?? this.route.snapshot.parent?.paramMap.get('userId') ?? ''));
  readonly type = computed(() => this.route.snapshot.paramMap.get('type') ?? '');
  readonly categoryName = computed(() => TYPE_LABELS[this.type()] ?? this.type());
  readonly items = signal<WardrobeItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.adminContext.userId() ?? this.route.snapshot.parent?.paramMap.get('userId');
    const t = this.type();
    if (!id || !t) return;
    this.adminService.getAdminWardrobe(id).subscribe({
      next: (list) => {
        const filtered = (list ?? []).filter(
          (i) => (i.type ?? i['type'] ?? '').toLowerCase().replace(/\s+/g, '_') === t
        );
        this.items.set(filtered);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
