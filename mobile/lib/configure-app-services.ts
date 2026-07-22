import { configureAuthBackend } from '@shared/services/auth-backend'
import { configureGamificationPersistence } from '@shared/services/gamification-persistence'
import { bootstrapAiOrchestration } from './ai-callable-client'
import { createFirebaseAuthBackend } from './firebase-auth-backend'
import { createFirestoreGamificationPersistence } from './firestore-gamification-repository'

export function configureAppServices() {
  configureAuthBackend(createFirebaseAuthBackend())
  configureGamificationPersistence(createFirestoreGamificationPersistence())
  bootstrapAiOrchestration()
}
