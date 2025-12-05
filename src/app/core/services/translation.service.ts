import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { translations } from '@translations';
import { LanguageOption, SupportedLang } from '@models/language.model';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly LANG_KEY = 'lang';
  private readonly defaultLang: SupportedLang = 'en';
  private languageOptions: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'nl', label: 'Nederlands' },
  ];

  private translate = inject(TranslateService);

  init() {
    this.registerTranslations();
    const savedLang = localStorage.getItem(this.LANG_KEY);
    const browserLang = navigator.language.split('-')[0];

    const activeLang = this.resolveLanguage(savedLang || browserLang);

    this.setActiveLanguage(activeLang);
  }

  setActiveLanguage(lang: SupportedLang) {
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  getActiveLanguage(): SupportedLang {
    return (this.translate.currentLang as SupportedLang) || this.defaultLang;
  }

  getAvailableLanguages(): LanguageOption[] {
    return this.languageOptions;
  }

  private resolveLanguage(input: string | null): SupportedLang {
    return this.languageOptions.some((lang) => lang.code === input)
      ? (input as SupportedLang)
      : this.defaultLang;
  }

  private registerTranslations(): void {
    (Object.keys(translations) as SupportedLang[]).forEach((lang) => {
      this.translate.setTranslation(lang, translations[lang], true);
    });
  }
}
