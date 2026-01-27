import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-count-badge',
  templateUrl: './count-badge.component.html',
  styleUrls: ['./count-badge.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CountBadgeComponent {
  @Input() count = 0;
  @Input() size = 44;
  @Input() backgroundColor = '';
  @Input() textColor = '';
  @Input() borderColor = '';
  @Input() fontSize = 0;
}
