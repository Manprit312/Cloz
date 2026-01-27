import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-photo-upgrade-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './photo-upgrade-card.component.html',
  styleUrls: ['./photo-upgrade-card.component.scss'],
})
export class PhotoUpgradeCardComponent {
  @Input() title: string = 'Photo upgrade recommended';
  @Input() subtitle: string =
    'Upgrade the photo for a cleaner, boutique-style wardrobe view.';
  @Input() disabled: boolean = false;

  @Output() upgrade = new EventEmitter<void>();

  onClick(): void {
    if (this.disabled) {
      return;
    }
    this.upgrade.emit();
  }
}

