import { createContext } from 'react'
import type { AuthUser } from '../types/auth'

export type AuthContextValue = {
  currentUser: AuthUser | null
  isAuthLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
