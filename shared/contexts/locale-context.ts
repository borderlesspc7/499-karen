import { createContext } from 'react'
import type { AppLocale } from '../types/locale'
import type { TranslationKey, TranslationParams } from '../i18n'

export type LocaleContextValue = {
  locale: AppLocale
  isHydrated: boolean
  setLocale: (locale: AppLocale) => Promise<void>
  t: (key: TranslationKey | string, params?: TranslationParams) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
