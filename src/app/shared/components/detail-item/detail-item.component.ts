import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-item.component.html',
  styleUrls: ['./detail-item.component.scss'],
})
export class DetailItemComponent {
  @Input() label: string = '';
  @Input() value: string = '';
}













