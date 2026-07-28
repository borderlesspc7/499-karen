import { ActivityIndicator, Platform, View } from 'react-native'
import { Redirect, Tabs } from 'expo-router'
import {
  useAuth,
  useGamification,
  useSubscription,
  useTheme,
  useTranslation,
} from '@shared/contexts'
import { requiresEmailVerification } from '@shared/utils/auth-guards'
import { OnboardingModal } from '@/components/OnboardingModal'
import { GuidedFirstRun } from '@/components/guidance/GuidedFirstRun'
import { SummusAppShell } from '@/components/layout/SummusAppShell'
import { SummusBottomTabBar } from '@/components/layout/SummusBottomTabBar'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export default function TabLayout() {
  const { currentUser, isAuthLoading } = useAuth()
  const { isHydrated, isOnboardingComplete } = useGamification()
  const { hasActiveSubscription, isSubscriptionLoading } = useSubscription()
  const { isHydrated: isThemeHydrated } = useTheme()
  const { t } = useTranslation()
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()
  const hideMobileTabBar = Platform.OS === 'web' && isWebDesktop

  if (isAuthLoading || isSubscriptionLoading || !isHydrated || !isThemeHydrated) {
    return (
      <View className={['flex-1 items-center justify-center', tc.shell].join(' ')}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    )
  }

  if (!currentUser) {
    return <Redirect href="/login" />
  }

  if (requiresEmailVerification(currentUser)) {
    return <Redirect href="/verify-email" />
  }

  if (!hasActiveSubscription) {
    return <Redirect href="/plans" />
  }

  return (
    <View className="flex-1">
      <SummusAppShell>
        {isOnboardingComplete ? <GuidedFirstRun enabled /> : null}
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
              title: t('nav.meridian'),
            }}
          />
          <Tabs.Screen
            name="workforce"
            options={{
              title: t('nav.enginesMeridian'),
            }}
          />
          <Tabs.Screen
            name="integrations"
            options={{
              title: t('nav.channels'),
            }}
          />
          <Tabs.Screen
            name="campaign-magic"
            options={{
              title: t('nav.campaigns'),
            }}
          />
          <Tabs.Screen
            name="inbox"
            options={{
              title: t('nav.inbox'),
            }}
          />
          <Tabs.Screen name="conversations" options={{ href: null }} />

          <Tabs.Screen name="ai-coach" options={{ href: null }} />
          <Tabs.Screen name="learn" options={{ href: null }} />
          <Tabs.Screen
            name="opportunities"
            options={{
              title: t('nav.opportunities'),
            }}
          />
          <Tabs.Screen
            name="crm"
            options={{
              href: null,
              title: t('nav.crm'),
            }}
          />
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

      {/* Fora do shell/Modal RN: cobre tudo após o plano e não pode ser pulado */}
      <OnboardingModal visible={!isOnboardingComplete} />
    </View>
  )
}
