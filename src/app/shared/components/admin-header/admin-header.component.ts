import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { IconComponent } from '../icon/icon.component';

export type AdminHeaderVariant = 'logo' | 'back';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonHeader, IonToolbar, IconComponent],
})
export class AdminHeaderComponent {
  /** Visual variant: logo (white bar + "Clōz") or back (blue bar + arrow + title) */
  @Input() variant: AdminHeaderVariant = 'logo';

  /** Centered title for back variant (e.g. user name) */
  @Input() title = '';

  /** User initials shown in the avatar circle (e.g. "JD"). Overridden by deriving from userName when set. */
  @Input() userInitials = '';

  /** User's full name; initials are derived as first letter of first word + first letter of last word when userInitials is empty */
  @Input() userName = '';

  /** Router link for logo click (logo variant). When set, logo is a link. */
  @Input() logoLink: string | null = null;

  /** Router link for back navigation (back variant). When set, back uses this link instead of history.back(). */
  @Input() backLink: string | null = null;

  /** Router link for avatar click (e.g. user profile). Defaults to /tabs/profile. */
  @Input() profileLink: string = '/tabs/profile';

  /** Emitted when the back button is tapped (back variant). If handled, navigation is not performed. */
  @Output() back = new EventEmitter<void>();

  /** Emitted when the avatar is tapped (only when profileLink is not used). */
  @Output() avatarClick = new EventEmitter<void>();

  @HostBinding('class.admin-header-logo')
  get isLogoVariant(): boolean {
    return this.variant === 'logo';
  }

  @HostBinding('class.admin-header-back')
  get isBackVariant(): boolean {
    return this.variant === 'back';
  }

  /** Initials to show in avatar: userInitials if set, otherwise derived from userName */
  get displayInitials(): string {
    if (this.userInitials) return this.userInitials;
    return this.getInitialsFromName(this.userName);
  }

  private getInitialsFromName(name: string): string {
    if (!name || !String(name).trim()) return '';
    const words = String(name).trim().split(/\s+/);
    const first = words[0]?.[0] ?? '';
    const last =
      words.length > 1
        ? (words[words.length - 1]?.[0] ?? '')
        : (words[0]?.[1] ?? '');
    return (first + last).toUpperCase();
  }

  constructor(
    private readonly router: Router,
    private readonly location: Location
  ) {}

  onBackClick(): void {
    this.back.emit();
    if (this.back.observers.length > 0) {
      return;
    }
    if (this.backLink) {
      this.router.navigateByUrl(this.backLink);
    } else {
      this.location.back();
    }
  }

  onAvatarClick(): void {
    if (this.avatarClick.observers.length > 0) {
      this.avatarClick.emit();
      return;
    }
    if (this.profileLink) {
      this.router.navigateByUrl(this.profileLink);
    }
  }
}
