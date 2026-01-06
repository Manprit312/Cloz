import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'image' | 'card' | 'list' | 'custom' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() borderRadius: string = '4px';
  @Input() count: number = 1; // For list items
  @Input() animated: boolean = true;
}

