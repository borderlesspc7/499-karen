import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getAuthBackend, type SocialAuthCredential } from '../services/auth-backend'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { AuthUser, SocialAuthProvider } from '../types/auth'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const authBackend = getAuthBackend()

    const unsubscribe = authBackend.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setIsAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await getAuthBackend().signIn(email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    await getAuthBackend().signUp(email, password)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await getAuthBackend().resetPassword(email)
  }, [])

  const sendEmailVerification = useCallback(async () => {
    await getAuthBackend().sendEmailVerification()
  }, [])

  const reloadCurrentUser = useCallback(async () => {
    const user = await getAuthBackend().reloadCurrentUser()
    setCurrentUser(user)
    return user
  }, [])

  const signInWithSocial = useCallback(async (credential: SocialAuthCredential) => {
    await getAuthBackend().signInWithSocial(credential)
  }, [])

  const signInWithSocialPopup = useCallback(async (provider: SocialAuthProvider) => {
    await getAuthBackend().signInWithSocialPopup(provider)
  }, [])

  const signOutUser = useCallback(async () => {
    await getAuthBackend().signOut()
  }, [])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthLoading,
      signIn,
      signUp,
      resetPassword,
      sendEmailVerification,
      reloadCurrentUser,
      signInWithSocial,
      signInWithSocialPopup,
      signOutUser,
    }),
    [
      currentUser,
      isAuthLoading,
      signIn,
      signUp,
      resetPassword,
      sendEmailVerification,
      reloadCurrentUser,
      signInWithSocial,
      signInWithSocialPopup,
      signOutUser,
    ],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
