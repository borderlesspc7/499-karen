import type { AppLocale } from '../types/locale'
import type { TranslationDictionary, TranslationParams } from './types'
import { enUS } from './dictionaries/en-US'
import { esES } from './dictionaries/es-ES'
import { ptBR } from './dictionaries/pt-BR'

export type { TranslationDictionary, TranslationParams } from './types'
export { detectDeviceLocale, coerceAppLocale } from './detect-locale'

const DICTIONARIES: Record<AppLocale, TranslationDictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
}

type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, string>
    ? `${K}.${keyof T[K] & string}`
    : never
}[keyof T & string]

export type TranslationKey = NestedKeyOf<typeof ptBR>

function resolvePath(dictionary: TranslationDictionary, key: string): string | undefined {
  const dot = key.indexOf('.')
  if (dot <= 0) return undefined

  const section = key.slice(0, dot)
  const leaf = key.slice(dot + 1)
  const sectionValue = dictionary[section]
  return sectionValue?.[leaf]
}

export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = params[token]
    return value === undefined || value === null ? `{{${token}}}` : String(value)
  })
}

export function translate(
  locale: AppLocale,
  key: TranslationKey | string,
  params?: TranslationParams,
): string {
  const primary = resolvePath(DICTIONARIES[locale], key)
  const fallback = resolvePath(DICTIONARIES['pt-BR'], key)
  const template = primary ?? fallback ?? key
  return interpolate(template, params)
}

export function getDictionary(locale: AppLocale): TranslationDictionary {
  return DICTIONARIES[locale]
}

export function createTranslator(locale: AppLocale) {
  return (key: TranslationKey | string, params?: TranslationParams) =>
    translate(locale, key, params)
}
