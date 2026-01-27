import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import {
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabButton,
    IonTabs,
    TranslateModule,
    IonLabel,
    IonTabBar,
    RouterModule,
    IconComponent,
  ],
})
export class TabsPage implements OnInit, OnDestroy {
  hideTabBar = false;
  /** Current tab segment for icon color: primary when active, gray otherwise */
  activeTab: 'wardrobe' | 'outfits' | 'profile' = 'wardrobe';
  private routerSubscription?: Subscription;

  // Routes where tab bar should be hidden
  private hiddenTabBarRoutes = [
    '/tabs/wardrobe/add-upper-garment',
    '/tabs/wardrobe/add-bottom',
    '/tabs/wardrobe/add-shoes',
    '/tabs/wardrobe/add-accessory',
    '/tabs/wardrobe/ai-cleanup',

    '/tabs/outfits/create-outfit',
    '/tabs/outfits/edit-outfit',
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects || event.url);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute(url: string): void {
    // Check if current route should hide tab bar
    this.hideTabBar = this.hiddenTabBarRoutes.some(route => url.includes(route));
    // Derive active tab for icon color (primary vs gray)
    if (url.includes('/tabs/wardrobe')) {
      this.activeTab = 'wardrobe';
    } else if (url.includes('/tabs/outfits')) {
      this.activeTab = 'outfits';
    } else if (url.includes('/tabs/profile')) {
      this.activeTab = 'profile';
    }
  }

  /** Icon color: primary when this tab is active, gray otherwise */
  tabIconColor(tab: 'wardrobe' | 'outfits' | 'profile'): string {
    return this.activeTab === tab
      ? 'var(--ion-color-primary)'
      : 'var(--text-color-600)';
  }
}
