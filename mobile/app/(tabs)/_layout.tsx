import { ActivityIndicator, Platform, View } from 'react-native'
import { Redirect, Tabs } from 'expo-router'
import { useAuth, useGamification, useTheme } from '@shared/contexts'
import { OnboardingModal } from '@/components/OnboardingModal'
import { SummusAppShell } from '@/components/layout/SummusAppShell'
import { SummusBottomTabBar } from '@/components/layout/SummusBottomTabBar'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export default function TabLayout() {
  const { currentUser, isAuthLoading } = useAuth()
  const { isHydrated, isOnboardingComplete } = useGamification()
  const { isHydrated: isThemeHydrated } = useTheme()
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()
  const hideMobileTabBar = Platform.OS === 'web' && isWebDesktop

  if (isAuthLoading || !isHydrated || !isThemeHydrated) {
    return (
      <View className={['flex-1 items-center justify-center', tc.shell].join(' ')}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    )
  }

  if (!currentUser) {
    return <Redirect href="/login" />
  }

  return (
    <SummusAppShell>
      <OnboardingModal visible={!isOnboardingComplete} />
      <Tabs
        initialRouteName={isOnboardingComplete ? 'index' : 'integrations'}
        tabBar={
          hideMobileTabBar
            ? () => null
            : (props) => <SummusBottomTabBar {...props} />
        }
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          sceneStyle: { flex: 1, backgroundColor: tc.sceneBg },
          tabBarStyle: { backgroundColor: tc.tabBarBg, borderTopColor: tc.tabBarBorder },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Núcleo Cognitivo',
          }}
        />
        <Tabs.Screen
          name="workforce"
          options={{
            title: 'Motores Cognitivos',
          }}
        />
        <Tabs.Screen
          name="integrations"
          options={{
            title: 'Canais',
          }}
        />
        <Tabs.Screen
          name="campaign-magic"
          options={{
            title: 'Campanhas',
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
          }}
        />
        <Tabs.Screen name="conversations" options={{ href: null }} />

        <Tabs.Screen name="ai-coach" options={{ href: null }} />
        <Tabs.Screen name="learn" options={{ href: null }} />
        <Tabs.Screen
          name="opportunities"
          options={{
            title: 'Oportunidades',
          }}
        />
        <Tabs.Screen name="crm" options={{ href: null }} />
        <Tabs.Screen name="automations" options={{ href: null }} />
        <Tabs.Screen name="treasure-vault" options={{ href: null }} />
        <Tabs.Screen name="tasks" options={{ href: null }} />
        <Tabs.Screen name="marketing" options={{ href: null }} />
        <Tabs.Screen name="bookings" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
        <Tabs.Screen name="resources" options={{ href: null }} />
        <Tabs.Screen name="clientes" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </SummusAppShell>
  )
}
