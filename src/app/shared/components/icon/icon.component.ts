import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconName, ICON_MAPPING } from './icon.types';

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
  name = input<IconName>('wardrobe');

  /**
   * The variant of the icon (line or solid)
   */
  variant = input<'line' | 'solid'>('line');

  /**
   * The size of the icon in pixels
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
   * Get the actual sprite ID for the logical icon name and variant
   */
  spriteId = computed(() => {
    const iconName = this.name();
    const iconMapping = ICON_MAPPING[iconName];

    // If icon doesn't exist in mapping, fallback to wardrobe
    if (!iconMapping) {
      const fallbackMapping = ICON_MAPPING['wardrobe'];
      if (typeof fallbackMapping === 'string') {
        return fallbackMapping;
      }
      return fallbackMapping[this.variant()];
    }

    // If it's a string, return as-is
    if (typeof iconMapping === 'string') {
      return iconMapping;
    }

    // If it's an object with line/solid variants, return the requested variant
    return iconMapping[this.variant()];
  });

  /**
   * Computed size string for CSS
   */
  iconSize = computed(() => `${this.size()}px`);

  /**
   * Computed style object for the icon
   */
  iconStyle = computed(() => ({
    width: this.iconSize(),
    height: this.iconSize(),
    '--icon-color': this.color(),
  }));

  /**
   * Computed class string for the icon
   */
  iconClass = computed(() => {
    const baseClass = 'app-icon';
    const customClass = this.className();
    return customClass ? `${baseClass} ${customClass}` : baseClass;
  });
}

