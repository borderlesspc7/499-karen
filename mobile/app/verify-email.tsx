import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native'
import { Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth, useGamification, useSubscription } from '@shared/contexts'
import { getAuthErrorMessage } from '@shared/services'
import { requiresEmailVerification } from '@shared/utils/auth-guards'
import { SummusLogo } from '@/components/ui/SummusLogo'
import { summusBrand } from '@/constants/summus-brand'

export default function VerifyEmailScreen() {
  const {
    currentUser,
    isAuthLoading,
    sendEmailVerification,
    reloadCurrentUser,
    signOutUser,
  } = useAuth()
  const { isHydrated, isOnboardingComplete } = useGamification()
  const { hasActiveSubscription, isSubscriptionLoading } = useSubscription()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!currentUser || !requiresEmailVerification(currentUser)) {
      return
    }

    const interval = setInterval(() => {
      void reloadCurrentUser()
    }, 4000)

    return () => clearInterval(interval)
  }, [currentUser, reloadCurrentUser])

  if (isAuthLoading || (currentUser && (isSubscriptionLoading || !isHydrated))) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: summusBrand.backgroundColor }}
      >
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    )
  }

  if (!currentUser) {
    return <Redirect href="/login" />
  }

  if (!requiresEmailVerification(currentUser)) {
    if (!hasActiveSubscription) {
      return <Redirect href="/plans" />
    }

    return (
      <Redirect href={isOnboardingComplete ? '/(tabs)' : '/(tabs)/integrations'} />
    )
  }

  async function handleResend() {
    setErrorMessage('')
    setSuccessMessage('')
    setIsResending(true)

    try {
      await sendEmailVerification()
      setSuccessMessage('Reenviamos o e-mail de confirmação.')
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsResending(false)
    }
  }

  async function handleCheck() {
    setErrorMessage('')
    setSuccessMessage('')
    setIsChecking(true)

    try {
      const user = await reloadCurrentUser()
      if (user && !requiresEmailVerification(user)) {
        setSuccessMessage('E-mail confirmado. Entrando…')
      } else {
        setErrorMessage('Ainda não detectamos a confirmação. Abra o link do e-mail e tente de novo.')
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: summusBrand.backgroundColor }}
    >
      <View className="flex-1 justify-center gap-8 p-6">
        <SummusLogo centered />

        <View className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-sm">
          <Text className="text-2xl font-semibold text-navy">Confirme seu e-mail</Text>
          <Text className="mt-2 text-sm leading-5 text-slate-500">
            Enviamos um link de ativação para{' '}
            <Text className="font-semibold text-navy">{currentUser.email}</Text>. Sua conta
            só é liberada depois da confirmação.
          </Text>

          <View className="mt-6 gap-3">
            {errorMessage ? (
              <Text className="text-sm font-medium text-rose-600">{errorMessage}</Text>
            ) : null}
            {successMessage ? (
              <Text className="text-sm font-medium text-emerald-600">{successMessage}</Text>
            ) : null}

            <Pressable
              onPress={() => void handleCheck()}
              disabled={isChecking}
              className="rounded-2xl bg-gold py-3.5 active:opacity-90 disabled:opacity-70"
            >
              <Text className="text-center text-sm font-bold text-deepBlue">
                {isChecking ? 'Verificando…' : 'Já confirmei'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void handleResend()}
              disabled={isResending}
              className="rounded-2xl border border-slate-200 py-3.5 active:opacity-90 disabled:opacity-70"
            >
              <Text className="text-center text-sm font-semibold text-navy">
                {isResending ? 'Reenviando…' : 'Reenviar e-mail'}
              </Text>
            </Pressable>

            <Pressable onPress={() => void signOutUser()}>
              <Text className="text-center text-sm text-slate-500">Usar outra conta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
