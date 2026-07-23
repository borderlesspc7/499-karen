import { configureAuthBackend } from '@shared/services/auth-backend'
import { configureGamificationPersistence } from '@shared/services/gamification-persistence'
import { configureSubscriptionPersistence } from '@shared/services/subscription-backend'
import { bootstrapAiOrchestration } from './ai-callable-client'
import { createFirebaseAuthBackend } from './firebase-auth-backend'
import { createFirestoreGamificationPersistence } from './firestore-gamification-repository'
import { createFirestoreSubscriptionPersistence } from './firestore-subscription-repository'
import { bootstrapSubscriptionBilling } from './stripe-billing-client'

export function configureAppServices() {
  configureAuthBackend(createFirebaseAuthBackend())
  configureGamificationPersistence(createFirestoreGamificationPersistence())
  configureSubscriptionPersistence(createFirestoreSubscriptionPersistence())
  bootstrapSubscriptionBilling()
  bootstrapAiOrchestration()
}
