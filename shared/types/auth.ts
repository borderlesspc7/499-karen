export type SocialAuthProvider = 'google' | 'apple' | 'facebook' | 'microsoft'

export type AuthUser = {
  id: string
  email: string
  emailVerified: boolean
  providerIds: string[]
}

/** @deprecated Use AuthUser */
export type MockUser = AuthUser
