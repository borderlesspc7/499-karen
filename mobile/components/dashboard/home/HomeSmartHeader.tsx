import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { premiumShadows } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type HomeSmartHeaderProps = {
  userName: string
  actionCount?: number
}

function resolveGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Bom dia'
  }

  if (hour < 18) {
    return 'Boa tarde'
  }

  return 'Boa noite'
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
  const greeting = resolveGreeting()
  const initials = resolveInitials(userName)
  const tc = useThemeClasses()

  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1 gap-2">
        <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
          {greeting}, {userName}.
        </Text>
        <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
          Veja o panorama do negócio e escolha a próxima ação com clareza.
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
        accessibilityLabel="Abrir área do usuário"
      >
        <Text className={['text-sm font-bold', tc.textPrimary].join(' ')}>{initials}</Text>
      </Pressable>
    </View>
  )
}
