import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { home, settings } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  template: ` <ion-tabs>
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="home" [routerLink]="['/tabs/home']">
        <ion-icon name="home"></ion-icon>
        <ion-label>{{ 'TABS.HOME' | translate }}</ion-label>
      </ion-tab-button>
      <ion-tab-button tab="settings" [routerLink]="['/tabs/settings']">
        <ion-icon name="settings"></ion-icon>
        <ion-label>{{ 'TABS.SETTINGS' | translate }}</ion-label>
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
    IonIcon,
    IonTabBar,
    RouterModule,
  ],
})
export class TabsPage implements OnInit {
  constructor() {
    addIcons({ home, settings });
  }

  ngOnInit() {}
}
