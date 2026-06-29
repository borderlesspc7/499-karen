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
import { useAuth, useGamification } from '@shared/contexts'
import { getAuthErrorMessage } from '@shared/services'
import { SummusLogo } from '@/components/ui/SummusLogo'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type AuthMode = 'signin' | 'signup' | 'reset'

const authModeContent: Record<
  AuthMode,
  { title: string; subtitle: string; submitLabel: string; toggleLabel: string }
> = {
  signin: {
    title: 'Entrar',
    subtitle: 'Acesse sua plataforma Summus Edge com segurança.',
    submitLabel: 'Entrar na plataforma',
    toggleLabel: 'Ainda não tem conta? Cadastre-se',
  },
  signup: {
    title: 'Cadastrar',
    subtitle: 'Crie sua conta e prepare sua operação para escalar.',
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
  const { isWebDesktop } = useResponsiveLayout()
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const content = useMemo(() => authModeContent[authMode], [authMode])

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  if (currentUser) {
    if (!isHydrated) {
      return (
        <View className="flex-1 items-center justify-center bg-deepBlue">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )
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
    <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <View className="mb-6 items-center">
        <SummusLogo />
      </View>
      <Text className="mt-3 text-2xl font-semibold text-slate-900">{content.title}</Text>
      <Text className="mt-2 text-sm text-slate-500">{content.subtitle}</Text>

      <View className="mt-6 gap-4">
        <View>
          <Text className="mb-2 text-sm font-medium text-slate-700">E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            placeholder="seu@email.com"
          />
        </View>

        {authMode !== 'reset' ? (
          <View>
            <Text className="mb-2 text-sm font-medium text-slate-700">Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
              placeholder="••••••"
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
          className="rounded-2xl bg-violet-600 py-3.5 active:bg-violet-500 disabled:opacity-70"
        >
          <Text className="text-center text-sm font-semibold text-white">
            {isSubmitting ? 'Processando...' : content.submitLabel}
          </Text>
        </Pressable>

        <Pressable onPress={handleModeToggle}>
          <Text className="text-center text-sm font-medium text-violet-600">
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
      <View className="min-h-full flex-1 flex-row bg-slate-100">
        <View className="flex-1 justify-center bg-summus-900 px-16">
          <SummusLogo />
          <Text className="mt-8 max-w-lg text-4xl font-semibold text-white">
            Gamificação premium e IA para escalar seu negócio.
          </Text>
          <Text className="mt-4 max-w-md text-lg text-slate-400">
            Funil, coach de IA, automações e analytics em uma experiência Elite.
          </Text>
        </View>
        <View className="w-[480px] shrink-0 items-center justify-center px-10">
          <View className="w-full max-w-md">{form}</View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center p-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mx-auto w-full max-w-md">{form}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
