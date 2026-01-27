import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DetailTabOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-detail-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-tabs.component.html',
  styleUrls: ['./detail-tabs.component.scss'],
})
export class DetailTabsComponent {
  @Input() tabs: DetailTabOption[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string): void {
    if (tabId === this.activeTab) {
      return;
    }
    this.tabChange.emit(tabId);
  }
}
