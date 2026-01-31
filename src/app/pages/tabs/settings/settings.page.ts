import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { AuthService, TranslationService } from '@app-core';
import {
  IonContent,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { SupportedLang } from '@models/language.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSelect,
    IonSelectOption,
    TranslateModule,
    IonItem,
    IonLabel,
    IonToggle,
    RouterLink,
  ],
})
export class SettingsPage {
  private ts = inject(TranslationService);
  private auth = inject(AuthService);

  isAdmin = computed(() => this.auth.userRole() === 'admin');
  currentLang = this.ts.getActiveLanguage();
  availableLangs = this.ts.getAvailableLanguages();
  isDark = localStorage.getItem('theme') === 'dark';

  changeLang(lang: SupportedLang) {
    this.ts.setActiveLanguage(lang);
    this.currentLang = lang;
  }

  toggleDarkMode(event: any) {
    this.isDark = event.detail.checked;
    document.body.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }
}
