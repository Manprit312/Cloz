import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() rounded: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() click = new EventEmitter<MouseEvent>();

  @HostBinding('class.btn-full-width')
  get isFullWidth(): boolean {
    return this.fullWidth;
  }

  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.variant}`, `btn-${this.size}`];
    
    if (this.fullWidth) {
      classes.push('btn-full-width');
    }
    
    if (this.rounded) {
      classes.push('btn-rounded');
    }
    
    if (this.disabled) {
      classes.push('btn-disabled');
    }
    
    return classes.join(' ');
  }

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.click.emit(event);
    }
  }
}

