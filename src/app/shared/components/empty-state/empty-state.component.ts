import { Component, HostBinding, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { IconName } from '../icon/icon.types';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
})
export class EmptyStateComponent {
  @Input() icon: IconName = 'wardrobe';
  @Input() iconSize: number = 64;
  @Input() iconColor: string = 'var(--text-color-600, #666666)';
  @Input() title: string = 'No items yet';
  @Input() description: string = 'Get started by adding your first item.';
  @Input() buttonText: string = 'Add item';
  @Input() showButton: boolean = true;
  @Input() compact: boolean = false;
  @Input() disableColumnStackNone: boolean = false;

  @HostBinding('class.compact')
  get isCompact(): boolean {
    return this.compact;
  }

  onButtonClick = output<void>();

  handleButtonClick(): void {
    this.onButtonClick.emit();
  }
}

