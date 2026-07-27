import type { AuthUser, SocialAuthProvider } from '../types/auth'

export type SocialAuthCredential = {
  provider: SocialAuthProvider
  idToken: string
  accessToken?: string
  nonce?: string
}

export type AuthBackend = {
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => () => void
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (email: string, password: string) => Promise<AuthUser>
  resetPassword: (email: string) => Promise<void>
  sendEmailVerification: () => Promise<void>
  reloadCurrentUser: () => Promise<AuthUser | null>
  signInWithSocial: (credential: SocialAuthCredential) => Promise<AuthUser>
  signInWithSocialPopup: (provider: SocialAuthProvider) => Promise<AuthUser>
  signOut: () => Promise<void>
}

let authBackend: AuthBackend | null = null

export function configureAuthBackend(backend: AuthBackend) {
  authBackend = backend
}

export function getAuthBackend(): AuthBackend {
  if (!authBackend) {
    throw new Error(
      'Auth backend not configured. Call configureAuthBackend() at app bootstrap.',
    )
  }

  return authBackend
}
