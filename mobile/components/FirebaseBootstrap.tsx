import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { getFirebaseConfigError } from '@/lib/env'
import { initializeFirebase } from '@/lib/firebase'
import { configureAppServices } from '@/lib/configure-app-services'

type FirebaseBootstrapProps = {
  children: ReactNode
}

export function FirebaseBootstrap({ children }: FirebaseBootstrapProps) {
  const [configError, setConfigError] = useState<string | null>(() => getFirebaseConfigError())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (configError) {
      return
    }

    try {
      initializeFirebase()
      configureAppServices()
      setIsReady(true)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível inicializar o Firebase.'
      setConfigError(message)
    }
  }, [configError])

  if (configError) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 px-8">
        <Text className="text-center text-lg font-semibold text-slate-900">
          Configuração incompleta
        </Text>
        <Text className="mt-3 text-center text-sm leading-6 text-slate-600">{configError}</Text>
        <Text className="mt-6 text-center text-xs text-slate-500">
          No EAS Build, configure EXPO_PUBLIC_FIREBASE_* no painel Expo (Environment variables) e
          gere o APK novamente.
        </Text>
      </View>
    )
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="mt-3 text-sm text-slate-500">Inicializando...</Text>
      </View>
    )
  }

  return children
}
