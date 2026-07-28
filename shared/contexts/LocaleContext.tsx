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
import { LocaleContext } from './locale-context'

type LocaleProviderProps = {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let isMounted = true

    getStorage()
      .getItem(LOCALE_STORAGE_KEY)
      .then((stored) => {
        if (!isMounted) {
          return
        }

        if (isAppLocale(stored)) {
          setLocaleState(stored)
        }

        setIsHydrated(true)
      })
      .catch(() => {
        if (isMounted) {
          setIsHydrated(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const setLocale = useCallback(async (next: AppLocale) => {
    setLocaleState(next)
    await getStorage().setItem(LOCALE_STORAGE_KEY, next)
  }, [])

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
