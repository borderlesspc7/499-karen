export type AppLocale = 'pt-BR' | 'en-US'

export const LOCALE_STORAGE_KEY = 'summus_locale_preference'

export const DEFAULT_LOCALE: AppLocale = 'pt-BR'

export const SUPPORTED_LOCALES: AppLocale[] = ['pt-BR', 'en-US']

export function isAppLocale(value: string | null): value is AppLocale {
  return value === 'pt-BR' || value === 'en-US'
}
