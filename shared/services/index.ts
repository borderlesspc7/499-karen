export { AuthError, MockAuthError, getAuthErrorMessage, isAuthError, mapFirebaseAuthError } from './auth-error'
export {
  configureAuthBackend,
  getAuthBackend,
  type AuthBackend,
} from './auth-backend'
export {
  configureGamificationPersistence,
  getGamificationPersistence,
  type GamificationPersistence,
} from './gamification-persistence'
