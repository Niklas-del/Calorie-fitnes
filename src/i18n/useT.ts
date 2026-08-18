import { useMemo } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { getTranslation, Translation } from './index';

/**
 * Returns the translation table for the currently selected language.
 *
 * Selecting the raw `language` string (a primitive) keeps the zustand selector
 * stable — see the note in useFoodLogStore about selectors that build new
 * values. The table itself is a module constant, so useMemo here is just to
 * avoid a lookup per render.
 */
export function useT(): Translation {
  const language = useLanguageStore((s) => s.language);
  return useMemo(() => getTranslation(language), [language]);
}
