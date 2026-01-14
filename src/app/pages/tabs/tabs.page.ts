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
  private routerSubscription?: Subscription;

  // Routes where tab bar should be hidden
  private hiddenTabBarRoutes = [
    '/tabs/wardrobe/add-upper-garment',
    '/tabs/wardrobe/add-bottom',
    '/tabs/wardrobe/add-shoes',
    '/tabs/wardrobe/add-accessory',


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
  }
}
