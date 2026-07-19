import '../global.css'

import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-reanimated'
import { configureStorage } from '@shared/storage'
import { AuthProvider, GamificationProvider, ThemeProvider } from '@shared/contexts'
import { createAsyncStorageAdapter } from '@/lib/async-storage'
import { premiumColors } from '@/constants/premium-theme'
import { FirebaseBootstrap } from '@/components/FirebaseBootstrap'
import { ThemeSync } from '@/components/ThemeSync'

export { ErrorBoundary } from 'expo-router'

configureStorage(createAsyncStorageAdapter())

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (error) {
      console.error('[fonts] Falha ao carregar SpaceMono:', error)
      SplashScreen.hideAsync()
    }
  }, [error])

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FirebaseBootstrap>
          <ThemeProvider>
            <ThemeSync />
            <AuthProvider>
              <GamificationProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="reports"
                    options={{
                      headerShown: Platform.OS !== 'web',
                      title: 'Relatórios',
                      headerStyle: { backgroundColor: premiumColors.navy },
                      headerTintColor: premiumColors.gold,
                    }}
                  />
                </Stack>
              </GamificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </FirebaseBootstrap>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
