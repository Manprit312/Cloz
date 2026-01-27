import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CarouselBadgeVariant = 'ai-enhanced' | 'original';

@Component({
  selector: 'app-carousel-badge',
  templateUrl: './carousel-badge.component.html',
  styleUrls: ['./carousel-badge.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CarouselBadgeComponent {
  /** 'original' = last carousel slide (dark), 'ai-enhanced' = other slides (blue) */
  variant = input<CarouselBadgeVariant>('ai-enhanced');

  get label(): string {
    return this.variant() === 'original' ? 'Original' : 'AI enhanced';
  }

  get isOriginal(): boolean {
    return this.variant() === 'original';
  }
}
