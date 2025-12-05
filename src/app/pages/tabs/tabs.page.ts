import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-tabs',
  template: ` <ion-tabs>
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="wardrobe" [routerLink]="['/tabs/wardrobe']">
        <app-icon [name]="'wardrobe'" [size]="24" [color]="'var(--ion-color-primary)'"></app-icon>
        <ion-label>Wardrobe</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="outfits" [routerLink]="['/tabs/outfits']">
        <app-icon [name]="'outfits'" [size]="24" [color]="'var(--ion-color-primary)'"></app-icon>
        <ion-label>Outfits</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="profile" [routerLink]="['/tabs/profile']">
        <app-icon [name]="'profile'" [size]="24" [color]="'var(--ion-color-primary)'"></app-icon>
        <ion-label>Profile</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>`,
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
export class TabsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
