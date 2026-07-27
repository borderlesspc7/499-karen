import { createContext } from 'react'
import type { AuthUser, SocialAuthProvider } from '../types/auth'
import type { SocialAuthCredential } from '../services/auth-backend'

export type AuthContextValue = {
  currentUser: AuthUser | null
  isAuthLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  sendEmailVerification: () => Promise<void>
  reloadCurrentUser: () => Promise<AuthUser | null>
  signInWithSocial: (credential: SocialAuthCredential) => Promise<void>
  signInWithSocialPopup: (provider: SocialAuthProvider) => Promise<void>
  signOutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
