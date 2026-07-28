import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Bell, Plus } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type RevenueHeaderProps = {
  userName: string
}

function resolveGreeting(
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const hour = new Date().getHours()
  if (hour < 12) return t('home.goodMorning')
  if (hour < 18) return t('home.goodAfternoon')
  return t('home.goodEvening')
}

function resolveInitials(userName: string): string {
  return userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function RevenueHeader({ userName }: RevenueHeaderProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()
  const { t } = useTranslation()
  const greeting = resolveGreeting(t)
  const initials = resolveInitials(userName)

  return (
    <View
      className={[
        'flex-row items-center justify-between gap-4',
        isWebDesktop ? 'pb-2' : 'pb-1',
      ].join(' ')}
    >
      <View className="min-w-0 flex-1">
        <Text
          className={[
            'font-bold tracking-tight',
            isWebDesktop ? 'text-2xl' : 'text-xl',
            tc.textPrimary,
          ].join(' ')}
        >
          {greeting}, {userName}.
        </Text>
        <Text className={['mt-1 text-sm', tc.textSecondary].join(' ')}>
          {t('home.summary')}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          className={[
            'relative h-10 w-10 items-center justify-center rounded-xl border',
            tc.isDark ? 'border-white/10 bg-white/5' : 'border-premiumBorder bg-white',
          ].join(' ')}
          accessibilityLabel={t('common.notifications')}
        >
          <Bell size={18} color={tc.isDark ? '#94A3B8' : premiumColors.textSecondary} />
          <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald" />
        </Pressable>

        {isWebDesktop ? (
          <Pressable
            onPress={() => router.push('/(tabs)/campaign-magic')}
            className="flex-row items-center gap-2 rounded-xl bg-navy px-4 py-2.5 active:opacity-90"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-sm font-semibold text-white">{t('home.newCampaign')}</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          className={[
            'h-10 w-10 items-center justify-center rounded-xl border',
            tc.isDark ? 'border-white/10 bg-white/5' : 'border-premiumBorder bg-white',
          ].join(' ')}
          accessibilityLabel={t('profile.openProfileA11y')}
        >
          <Text className={['text-xs font-bold', tc.textPrimary].join(' ')}>{initials}</Text>
        </Pressable>
      </View>
    </View>
  )
}
