/**
 * Persistência de assinatura em `users/{uid}.subscription`.
 *
 * Em produção, apenas Cloud Functions (Admin SDK / webhook Stripe)
 * devem gravar este campo. O fallback local mock existe para demos
 * sem Functions deployadas — ver EXPO_PUBLIC_STRIPE_MOCK_LOCAL.
 *
 * O listener ignora snapshots em que `subscription` não mudou, para
 * não reagir a writes de gamificação / outros campos no mesmo doc.
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

function serializeSubscription(subscription: UserSubscription | null): string {
  return JSON.stringify(subscription)
}

export function createFirestoreSubscriptionPersistence(
  db: Firestore = getFirestoreDb(),
): SubscriptionPersistence {
  return {
    subscribe(userId, listener) {
      const reference = doc(db, firestoreCollections.users, userId)
      let lastSerialized: string | null = null
      let hasEmitted = false

      return onSnapshot(
        reference,
        (snapshot) => {
          if (!snapshot.exists()) {
            if (!hasEmitted || lastSerialized !== 'null') {
              lastSerialized = 'null'
              hasEmitted = true
              listener(null)
            }
            return
          }

          const data = snapshot.data() as UserBillingDocument
          const next = parseUserSubscription(data.subscription)
          const serialized = serializeSubscription(next)

          if (hasEmitted && serialized === lastSerialized) {
            return
          }

          lastSerialized = serialized
          hasEmitted = true
          listener(next)
        },
        () => {
          if (!hasEmitted || lastSerialized !== 'null') {
            lastSerialized = 'null'
            hasEmitted = true
            listener(null)
          }
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
