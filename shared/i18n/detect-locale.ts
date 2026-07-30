import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from '../types/locale'

const SPANISH_REGIONS = new Set([
  'MX',
  'ES',
  'AR',
  'CO',
  'CL',
  'PE',
  'UY',
  'PY',
  'BO',
  'EC',
  'VE',
  'GT',
  'HN',
  'SV',
  'NI',
  'CR',
  'PA',
  'CU',
  'DO',
  'PR',
])

const ENGLISH_REGIONS = new Set(['US', 'GB', 'AU', 'CA', 'IE', 'NZ', 'ZA'])

const PORTUGUESE_REGIONS = new Set(['BR', 'PT', 'AO', 'MZ', 'CV'])

export type DetectLocaleInput = {
  /** BCP-47 tag, ex.: pt-BR, en-US, es-MX */
  languageTag?: string | null
  /** Código de região ISO 3166-1 alpha-2 */
  regionCode?: string | null
}

function normalizeTag(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/_/g, '-')
}

function languageCode(tag: string): string {
  return tag.split('-')[0]?.toLowerCase() ?? ''
}

function regionFromTag(tag: string): string {
  const parts = tag.split('-')
  if (parts.length < 2) {
    return ''
  }
  return parts[parts.length - 1]?.toUpperCase() ?? ''
}

/**
 * Resolve o locale do app a partir do idioma do dispositivo e/ou região.
 * Prioridade: idioma do dispositivo → região → padrão pt-BR.
 */
export function detectDeviceLocale(input: DetectLocaleInput = {}): AppLocale {
  const tag = normalizeTag(input.languageTag)
  const lang = languageCode(tag)
  const region = (input.regionCode ?? regionFromTag(tag)).toUpperCase()

  if (lang === 'pt') {
    return 'pt-BR'
  }
  if (lang === 'es') {
    return 'es-ES'
  }
  if (lang === 'en') {
    return 'en-US'
  }

  if (region && PORTUGUESE_REGIONS.has(region)) {
    return 'pt-BR'
  }
  if (region && SPANISH_REGIONS.has(region)) {
    return 'es-ES'
  }
  if (region && ENGLISH_REGIONS.has(region)) {
    return 'en-US'
  }

  return DEFAULT_LOCALE
}

export function coerceAppLocale(value: string | null | undefined): AppLocale | null {
  if (isAppLocale(value)) {
    return value
  }
  return null
}
