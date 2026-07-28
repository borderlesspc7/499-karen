import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import { premiumShadows } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type HomeSmartHeaderProps = {
  userName: string
  actionCount?: number
}

function resolveGreeting(t: (key: TranslationKey) => string): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return t('home.goodMorning')
  }

  if (hour < 18) {
    return t('home.goodAfternoon')
  }

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

export function HomeSmartHeader({ userName }: HomeSmartHeaderProps) {
  const { t } = useTranslation()
  const greeting = resolveGreeting(t)
  const initials = resolveInitials(userName)
  const tc = useThemeClasses()

  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1 gap-2">
        <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
          {t('home.greetingName', { greeting, name: userName })}
        </Text>
        <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
          {t('home.smartSubtitle')}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        className={[
          'h-11 w-11 items-center justify-center rounded-card border active:opacity-80',
          tc.isDark ? 'border-white/10 bg-white/10' : 'border-premiumBorder bg-white',
        ].join(' ')}
        style={premiumShadows.card}
        accessibilityRole="button"
        accessibilityLabel={t('profile.openProfileA11y')}
      >
        <Text className={['text-sm font-bold', tc.textPrimary].join(' ')}>{initials}</Text>
      </Pressable>
    </View>
  )
}
