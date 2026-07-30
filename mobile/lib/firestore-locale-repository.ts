import { doc, getDoc, setDoc, type DocumentData, type Firestore } from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import { coerceAppLocale } from '@shared/i18n/detect-locale'
import type { AppLocale } from '@shared/types/locale'

export type FirestoreLocaleRepository = {
  loadPreferredLocale(userId: string): Promise<AppLocale | null>
  savePreferredLocale(userId: string, locale: AppLocale): Promise<void>
}

export function createFirestoreLocaleRepository(db: Firestore): FirestoreLocaleRepository {
  return {
    async loadPreferredLocale(userId) {
      const document = await getDoc(doc(db, firestoreCollections.users, userId))
      if (!document.exists()) {
        return null
      }

      const data = document.data() as DocumentData
      return coerceAppLocale(
        typeof data.preferredLocale === 'string' ? data.preferredLocale : null,
      )
    },

    async savePreferredLocale(userId, locale) {
      await setDoc(
        doc(db, firestoreCollections.users, userId),
        {
          preferredLocale: locale,
          updatedAt: new Date().toISOString(),
        } as DocumentData,
        { merge: true },
      )
    },
  }
}
