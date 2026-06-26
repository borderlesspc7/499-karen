import { ActivityIndicator, View } from 'react-native'
import { Redirect, Tabs } from 'expo-router'
import { useAuth, useGamification } from '@shared/contexts'
import { OnboardingModal } from '@/components/OnboardingModal'
import { SummusAppShell } from '@/components/layout/SummusAppShell'
import { SummusBottomTabBar } from '@/components/layout/SummusBottomTabBar'

export default function TabLayout() {
  const { currentUser, isAuthLoading } = useAuth()
  const { isOnboardingComplete } = useGamification()

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-deepBlue">
        <ActivityIndicator size="large" color="#3B82F6" />
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
        tabBar={(props) => <SummusBottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          sceneStyle: { flex: 1, backgroundColor: '#F8FAFC' },
          tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="workforce"
          options={{
            title: 'Equipe IA',
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
            title: 'CRM',
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
      </Tabs>
    </SummusAppShell>
  )
}
