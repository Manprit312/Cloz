import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconName, MATERIAL_SYMBOLS_MAPPING, SPARK_ICONS_MAPPING } from './icon.types';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class IconComponent {
  /**
   * The logical name of the icon to display
   */
  name = input<IconName>('add');

  /**
   * The size of the icon in pixels (default: 24)
   */
  size = input<number>(24);

  /**
   * The color of the icon (CSS color value)
   */
  color = input<string>('');

  /**
   * Additional CSS classes to apply to the icon
   */
  className = input<string>('');

  /**
   * Get the Material Symbols icon name
   */
  iconName = computed(() => {
    const iconName = this.name();
    return MATERIAL_SYMBOLS_MAPPING[iconName] || MATERIAL_SYMBOLS_MAPPING['add'];
  });

  sparkIconId = computed(() => {
    return SPARK_ICONS_MAPPING[this.name()] || '';
  });

  sparkIconHref = computed(() => {
    const id = this.sparkIconId();
    return id ? encodeURIComponent(id) : '';
  });

  isSparkIcon = computed(() => {
    return !!this.sparkIconId();
  });

  /**
   * Computed style object for the icon
   */
  iconStyle = computed(() => {
    const styles: Record<string, string> = {
      'font-size': `${this.size()}px`,
      'width': `${this.size()}px`,
      'height': `${this.size()}px`,
      // Theme-aware default so icons are visible in light and dark on iOS simulator/device
      'color': this.color() || 'var(--ion-text-color)',
    };
    return styles;
  });

  /**
   * Computed class string for the icon
   */
  iconClass = computed(() => {
    const baseClass = 'material-symbols-rounded';
    const customClass = this.className();
    return customClass ? `${baseClass} ${customClass}` : baseClass;
  });
}
