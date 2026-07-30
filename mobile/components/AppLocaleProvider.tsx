import { useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { getLocales } from 'expo-localization'
import { LocaleProvider, useAuth } from '@shared/contexts'
import type { AppLocale } from '@shared/types/locale'
import { getFirestoreDb } from '@/lib/firebase'
import { createFirestoreLocaleRepository } from '@/lib/firestore-locale-repository'

type AppLocaleProviderProps = {
  children: ReactNode
}

export function AppLocaleProvider({ children }: AppLocaleProviderProps) {
  const { currentUser } = useAuth()
  const deviceLocale = useMemo(() => getLocales()[0], [])
  const localeRepository = useMemo(() => createFirestoreLocaleRepository(getFirestoreDb()), [])

  const loadPreferredLocale = useCallback(
    (userId: string) => localeRepository.loadPreferredLocale(userId),
    [localeRepository],
  )

  const savePreferredLocale = useCallback(
    (userId: string, locale: AppLocale) =>
      localeRepository.savePreferredLocale(userId, locale),
    [localeRepository],
  )

  return (
    <LocaleProvider
      userId={currentUser?.id ?? null}
      deviceLanguageTag={deviceLocale?.languageTag}
      deviceRegionCode={deviceLocale?.regionCode}
      loadPreferredLocale={loadPreferredLocale}
      savePreferredLocale={savePreferredLocale}
    >
      {children}
    </LocaleProvider>
  )
}
