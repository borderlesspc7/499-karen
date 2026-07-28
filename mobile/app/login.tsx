import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth, useGamification, useSubscription, useTranslation } from '@shared/contexts'
import { getAuthErrorMessage } from '@shared/services'
import { requiresEmailVerification } from '@shared/utils/auth-guards'
import { evaluatePasswordStrength, PASSWORD_MIN_LENGTH } from '@shared/utils/password-strength'
import type { PasswordFeedbackCode } from '@shared/utils/password-strength'
import type { TranslationKey } from '@shared/i18n'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { SummusLogo } from '@/components/ui/SummusLogo'
import { summusBrand } from '@/constants/summus-brand'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type AuthMode = 'signin' | 'signup' | 'reset'

const LOGIN_DRAFT_KEY = 'summus_login_draft_v1'

const PASSWORD_FEEDBACK_KEYS: Record<PasswordFeedbackCode, TranslationKey> = {
  minLength: 'password.minLength',
  uppercase: 'password.uppercase',
  lowercase: 'password.lowercase',
  number: 'password.number',
  special: 'password.special',
}

export default function LoginScreen() {
  const { currentUser, isAuthLoading, signIn, signUp, resetPassword } = useAuth()
  const { isHydrated, isOnboardingComplete } = useGamification()
  const { hasActiveSubscription, isSubscriptionLoading } = useSubscription()
  const { t, locale } = useTranslation()
  const { isWebDesktop } = useResponsiveLayout()
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftReady, setIsDraftReady] = useState(false)

  const content = useMemo(() => {
    if (authMode === 'signin') {
      return {
        title: t('auth.signinTitle'),
        subtitle: t('auth.signinSubtitle'),
        submitLabel: t('auth.signinSubmit'),
        toggleLabel: t('auth.signinToggle'),
      }
    }

    if (authMode === 'signup') {
      return {
        title: t('auth.signupTitle'),
        subtitle: t('auth.signupSubtitle'),
        submitLabel: t('auth.signupSubmit'),
        toggleLabel: t('auth.signupToggle'),
      }
    }

    return {
      title: t('auth.resetTitle'),
      subtitle: t('auth.resetSubtitle'),
      submitLabel: t('auth.resetSubmit'),
      toggleLabel: t('auth.resetToggle'),
    }
  }, [authMode, t])

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password])

  useEffect(() => {
    let isMounted = true

    void AsyncStorage.getItem(LOGIN_DRAFT_KEY).then((raw) => {
      if (!isMounted) return

      if (raw) {
        try {
          const draft = JSON.parse(raw) as { email?: string; authMode?: AuthMode }
          if (draft.email) setEmail(draft.email)
          if (draft.authMode === 'signin' || draft.authMode === 'signup') {
            setAuthMode(draft.authMode)
          }
        } catch {
          // rascunho inválido — ignora
        }
      }

      setIsDraftReady(true)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isDraftReady) return

    const timeout = setTimeout(() => {
      void AsyncStorage.setItem(
        LOGIN_DRAFT_KEY,
        JSON.stringify({
          email: email.trim(),
          authMode: authMode === 'reset' ? 'signin' : authMode,
        }),
      )
    }, 400)

    return () => clearTimeout(timeout)
  }, [email, authMode, isDraftReady])

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

  if (currentUser) {
    if (requiresEmailVerification(currentUser)) {
      return <Redirect href="/verify-email" />
    }

    if (!hasActiveSubscription) {
      return <Redirect href="/plans" />
    }

    return (
      <Redirect href={isOnboardingComplete ? '/(tabs)' : '/(tabs)/integrations'} />
    )
  }

  async function handleSubmit() {
    setErrorMessage('')
    setSuccessMessage('')

    if (authMode === 'signup') {
      if (!passwordStrength.isStrongEnough) {
        const requirements = passwordStrength.feedback
          .map((code) =>
            t(PASSWORD_FEEDBACK_KEYS[code], code === 'minLength' ? { n: PASSWORD_MIN_LENGTH } : undefined),
          )
          .join(', ')
          .toLowerCase()
        setErrorMessage(t('auth.weakPassword', { requirements }))
        return
      }

      if (password !== confirmPassword) {
        setErrorMessage(t('auth.passwordsMismatch'))
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (authMode === 'signin') {
        await signIn(email, password)
      } else if (authMode === 'signup') {
        await signUp(email, password)
        setSuccessMessage(t('auth.signupSuccess'))
      } else {
        await resetPassword(email)
        setSuccessMessage(t('auth.resetSuccess'))
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, locale))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleModeToggle() {
    setAuthMode((current) => {
      if (current === 'reset') return 'signin'
      return current === 'signin' ? 'signup' : 'signin'
    })
    setPassword('')
    setConfirmPassword('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const form = (
    <View className="rounded-3xl border border-white/10 bg-white p-6 shadow-sm">
      <Text className="text-2xl font-semibold text-navy">{content.title}</Text>
      <Text className="mt-2 text-sm leading-5 text-slate-500">{content.subtitle}</Text>

      <View className="mt-6 gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-slate-700">{t('auth.email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-navy"
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {authMode !== 'reset' ? (
          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">{t('auth.password')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={authMode === 'signup' ? 'new-password' : 'password'}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-navy"
              placeholder={authMode === 'signup' ? t('auth.passwordPlaceholderSignup') : '••••••••'}
              placeholderTextColor="#94A3B8"
            />
            {authMode === 'signup' ? <PasswordStrengthMeter password={password} /> : null}
          </View>
        ) : null}

        {authMode === 'signup' ? (
          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">
              {t('auth.confirmPassword')}
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-navy"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              placeholderTextColor="#94A3B8"
            />
            {confirmPassword.length > 0 && confirmPassword !== password ? (
              <Text className="mt-2 text-xs font-medium text-rose-600">
                {t('auth.passwordsMismatch')}
              </Text>
            ) : null}
          </View>
        ) : null}

        {errorMessage ? (
          <Text className="text-sm font-medium text-rose-600">{errorMessage}</Text>
        ) : null}
        {successMessage ? (
          <Text className="text-sm font-medium text-emerald-600">{successMessage}</Text>
        ) : null}

        <Pressable
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
          className="rounded-2xl bg-gold py-3.5 active:opacity-90 disabled:opacity-70"
        >
          <Text className="text-center text-sm font-bold text-deepBlue">
            {isSubmitting ? t('auth.processing') : content.submitLabel}
          </Text>
        </Pressable>

        {authMode !== 'reset' ? (
          <SocialAuthButtons
            disabled={isSubmitting}
            onError={(message) => {
              setSuccessMessage('')
              setErrorMessage(message)
            }}
          />
        ) : null}

        <Pressable onPress={handleModeToggle}>
          <Text className="text-center text-sm font-medium text-gold">
            {content.toggleLabel}
          </Text>
        </Pressable>

        {authMode === 'signin' ? (
          <Pressable onPress={() => setAuthMode('reset')}>
            <Text className="text-center text-sm text-slate-500">{t('auth.forgotPassword')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )

  if (isWebDesktop) {
    return (
      <View className="min-h-full flex-1 flex-row bg-surface">
        <View
          className="flex-1 items-center justify-center px-16"
          style={{ backgroundColor: summusBrand.backgroundColor }}
        >
          <View className="max-w-lg items-center">
            <SummusLogo centered />
            <Text className="mt-10 text-center text-4xl font-bold leading-tight text-white">
              {t('auth.heroTagline')}.
            </Text>
            <Text className="mt-4 text-center text-lg leading-7 text-white/55">
              {t('auth.heroPositioning')} {t('auth.heroSupport')}
            </Text>
          </View>
        </View>
        <View className="w-[480px] shrink-0 items-center justify-center bg-surface px-10">
          <View className="w-full max-w-md">{form}</View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: summusBrand.backgroundColor }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center gap-8 p-6"
          keyboardShouldPersistTaps="handled"
        >
          <SummusLogo centered />
          <View className="mx-auto w-full max-w-md">{form}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
