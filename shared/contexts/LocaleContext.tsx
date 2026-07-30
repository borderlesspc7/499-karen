import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getStorage } from '../storage'
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isAppLocale,
  type AppLocale,
} from '../types/locale'
import { createTranslator } from '../i18n'
import { detectDeviceLocale } from '../i18n/detect-locale'
import { LocaleContext } from './locale-context'

type LocaleProviderProps = {
  children: ReactNode
  userId?: string | null
  /** Idioma/região do dispositivo (ex.: expo-localization) */
  deviceLanguageTag?: string | null
  deviceRegionCode?: string | null
  loadPreferredLocale?: (userId: string) => Promise<AppLocale | null>
  savePreferredLocale?: (userId: string, locale: AppLocale) => Promise<void>
}

export function LocaleProvider({
  children,
  userId = null,
  deviceLanguageTag = null,
  deviceRegionCode = null,
  loadPreferredLocale,
  savePreferredLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function hydrate() {
      const detected = detectDeviceLocale({
        languageTag: deviceLanguageTag,
        regionCode: deviceRegionCode,
      })

      try {
        if (userId && loadPreferredLocale) {
          const remote = await loadPreferredLocale(userId)
          if (isMounted && remote) {
            setLocaleState(remote)
            await getStorage().setItem(LOCALE_STORAGE_KEY, remote)
            setIsHydrated(true)
            return
          }
        }

        const stored = await getStorage().getItem(LOCALE_STORAGE_KEY)
        if (!isMounted) {
          return
        }

        if (isAppLocale(stored)) {
          setLocaleState(stored)
        } else {
          setLocaleState(detected)
          await getStorage().setItem(LOCALE_STORAGE_KEY, detected)
        }
      } catch {
        if (isMounted) {
          setLocaleState(detected)
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true)
        }
      }
    }

    void hydrate()

    return () => {
      isMounted = false
    }
  }, [userId, loadPreferredLocale, deviceLanguageTag, deviceRegionCode])

  const setLocale = useCallback(
    async (next: AppLocale) => {
      setLocaleState(next)
      await getStorage().setItem(LOCALE_STORAGE_KEY, next)

      if (userId && savePreferredLocale) {
        try {
          await savePreferredLocale(userId, next)
        } catch {
          // Preferência local já aplicada; sync remoto é best-effort.
        }
      }
    },
    [userId, savePreferredLocale],
  )

  const value = useMemo(
    () => ({
      locale,
      isHydrated,
      setLocale,
      t: createTranslator(locale),
    }),
    [isHydrated, locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
