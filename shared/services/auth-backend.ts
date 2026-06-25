import type { AuthUser } from '../types/auth'

export type AuthBackend = {
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => () => void
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (email: string, password: string) => Promise<AuthUser>
  resetPassword: (email: string) => Promise<void>
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
