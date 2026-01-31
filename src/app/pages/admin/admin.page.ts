import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@app-core';
import { AdminHeaderComponent } from '../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    AdminHeaderComponent,
    IonContent,
    IonRouterOutlet,
    RouterModule,
  ],
})
export class AdminPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private navSub?: { unsubscribe: () => void };

  readonly currentUserName = computed(
    () => this.authService.user()?.name ?? this.authService.user()?.username ?? ''
  );

  readonly currentUrl = signal(this.router.url);
  readonly showLogoHeader = computed(() => {
    const url = this.currentUrl();
    return !url.includes('/users/') && !url.includes('/wardrobe/');
  });

  ngOnInit() {
    this.currentUrl.set(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentUrl.set(e.url));
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
  }
}
