import type { AuthUser } from '../types/auth'

const SOCIAL_PROVIDER_IDS = new Set([
  'google.com',
  'apple.com',
  'facebook.com',
  'microsoft.com',
  'oidc.microsoft',
])

export function hasSocialProvider(user: AuthUser): boolean {
  return user.providerIds.some((providerId) => SOCIAL_PROVIDER_IDS.has(providerId))
}

export function hasPasswordProvider(user: AuthUser): boolean {
  return user.providerIds.includes('password')
}

/**
 * Contas só com e-mail/senha precisam confirmar o e-mail antes de usar o app.
 * Login social (Google, Apple, etc.) libera o acesso sem esse gate.
 */
export function requiresEmailVerification(user: AuthUser | null): boolean {
  if (!user) {
    return false
  }

  if (user.emailVerified) {
    return false
  }

  if (hasSocialProvider(user)) {
    return false
  }

  return hasPasswordProvider(user) || user.providerIds.length === 0
}
