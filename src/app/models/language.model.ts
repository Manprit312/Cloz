import { translations } from '@translations';

export type SupportedLang = keyof typeof translations;
export interface LanguageOption {
  code: SupportedLang;
  label: string;
}
