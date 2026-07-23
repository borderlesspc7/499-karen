/**
 * Persistência de assinatura em `users/{uid}.subscription`.
 *
 * Em produção, apenas Cloud Functions (Admin SDK / webhook Stripe)
 * devem gravar este campo. O fallback local mock existe para demos
 * sem Functions deployadas — ver EXPO_PUBLIC_STRIPE_MOCK_LOCAL.
 */
import {
  doc,
  onSnapshot,
  setDoc,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { firestoreCollections } from '@shared/constants/firestore-collections'
import type { SubscriptionPersistence } from '@shared/services/subscription-backend'
import type { UserSubscription } from '@shared/types/subscription'
import { parseUserSubscription } from '@shared/utils/subscription-helpers'
import { getFirestoreDb } from './firebase'

type UserBillingDocument = {
  subscription?: UserSubscription | null
}

export function createFirestoreSubscriptionPersistence(
  db: Firestore = getFirestoreDb(),
): SubscriptionPersistence {
  return {
    subscribe(userId, listener) {
      const reference = doc(db, firestoreCollections.users, userId)

      return onSnapshot(
        reference,
        (snapshot) => {
          if (!snapshot.exists()) {
            listener(null)
            return
          }

          const data = snapshot.data() as UserBillingDocument
          listener(parseUserSubscription(data.subscription))
        },
        () => {
          listener(null)
        },
      )
    },

    async writeMockSubscription(userId, subscription) {
      await setDoc(
        doc(db, firestoreCollections.users, userId),
        {
          subscription,
          updatedAt: new Date().toISOString(),
        } as DocumentData,
        { merge: true },
      )
    },
  }
}
