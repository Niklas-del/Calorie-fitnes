import { de } from './de';
import { en, Translation } from './en';
import { pl } from './pl';

export type LanguageCode = 'en' | 'de' | 'pl';

// To add a language: create src/i18n/<code>.ts typed `: Translation` (TypeScript
// will list every key you still have to fill in), then add it here and to
// LANGUAGES below. Nothing else in the app needs to change.
const TRANSLATIONS: Record<LanguageCode, Translation> = { en, de, pl };

export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export function getTranslation(code: LanguageCode): Translation {
  return TRANSLATIONS[code] ?? en;
}

export type { Translation };
