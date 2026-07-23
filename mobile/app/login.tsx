import { useMemo, useState } from 'react'
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
import { useAuth, useGamification, useSubscription } from '@shared/contexts'
import { getAuthErrorMessage } from '@shared/services'
import { SummusLogo } from '@/components/ui/SummusLogo'
import { summusBrand } from '@/constants/summus-brand'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type AuthMode = 'signin' | 'signup' | 'reset'

const authModeContent: Record<
  AuthMode,
  { title: string; subtitle: string; submitLabel: string; toggleLabel: string }
> = {
  signin: {
    title: 'Entrar',
    subtitle: 'Seu Sistema Operacional Cognitivo está pronto para ampliar como você decide e age.',
    submitLabel: 'Entrar no Summus',
    toggleLabel: 'Ainda não tem conta? Cadastre-se',
  },
  signup: {
    title: 'Cadastrar',
    subtitle: 'Crie sua conta. Depois você escolhe o plano e libera o acesso.',
    submitLabel: 'Criar conta',
    toggleLabel: 'Já possui conta? Entrar',
  },
  reset: {
    title: 'Recuperar senha',
    subtitle: 'Enviaremos um link de redefinição para o seu e-mail.',
    submitLabel: 'Enviar link de recuperação',
    toggleLabel: 'Voltar para o login',
  },
}

function mapAuthErrorMessage(error: unknown) {
  return getAuthErrorMessage(error)
}

export default function LoginScreen() {
  const { currentUser, isAuthLoading, signIn, signUp, resetPassword } = useAuth()
  const { isHydrated, isOnboardingComplete } = useGamification()
  const { hasActiveSubscription, isSubscriptionLoading } = useSubscription()
  const { isWebDesktop } = useResponsiveLayout()
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const content = useMemo(() => authModeContent[authMode], [authMode])

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
    setIsSubmitting(true)

    try {
      if (authMode === 'signin') {
        await signIn(email, password)
      } else if (authMode === 'signup') {
        await signUp(email, password)
      } else {
        await resetPassword(email)
        setSuccessMessage('Enviamos um link de recuperação para o seu e-mail.')
      }
    } catch (error) {
      setErrorMessage(mapAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleModeToggle() {
    setAuthMode((current) => {
      if (current === 'reset') return 'signin'
      return current === 'signin' ? 'signup' : 'signin'
    })
    setErrorMessage('')
    setSuccessMessage('')
  }

  const form = (
    <View className="rounded-3xl border border-white/10 bg-white p-6 shadow-sm">
      <Text className="text-2xl font-semibold text-navy">{content.title}</Text>
      <Text className="mt-2 text-sm leading-5 text-slate-500">{content.subtitle}</Text>

      <View className="mt-6 gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-slate-700">E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-navy"
            placeholder="seu@email.com"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {authMode !== 'reset' ? (
          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-navy"
              placeholder="••••••"
              placeholderTextColor="#94A3B8"
            />
          </View>
        ) : null}

        {errorMessage ? (
          <Text className="text-sm font-medium text-rose-600">{errorMessage}</Text>
        ) : null}
        {successMessage ? (
          <Text className="text-sm font-medium text-emerald-600">{successMessage}</Text>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="rounded-2xl bg-gold py-3.5 active:opacity-90 disabled:opacity-70"
        >
          <Text className="text-center text-sm font-bold text-deepBlue">
            {isSubmitting ? 'Processando...' : content.submitLabel}
          </Text>
        </Pressable>

        <Pressable onPress={handleModeToggle}>
          <Text className="text-center text-sm font-medium text-gold">
            {content.toggleLabel}
          </Text>
        </Pressable>

        {authMode === 'signin' ? (
          <Pressable onPress={() => setAuthMode('reset')}>
            <Text className="text-center text-sm text-slate-500">Esqueci minha senha</Text>
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
              {summusBrand.taglinePt}.
            </Text>
            <Text className="mt-4 text-center text-lg leading-7 text-white/55">
              {summusBrand.positioning} Três motores permanentes. Uma única resposta integrada.
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
