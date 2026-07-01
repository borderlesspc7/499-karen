import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'

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

export function HomeSmartHeader({ userName, actionCount = 3 }: HomeSmartHeaderProps) {
  const greeting = resolveGreeting()
  const initials = resolveInitials(userName)

  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1 gap-2">
        <Text className="text-3xl font-bold tracking-tight text-deepBlue">
          {greeting}, {userName}.
        </Text>
        <Text className="text-base leading-6 text-slate-500">
          Hoje existem {actionCount} ações que podem acelerar o crescimento da sua empresa.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Abrir área do usuário"
      >
        <Text className="text-sm font-bold text-deepBlue">{initials}</Text>
      </Pressable>
    </View>
  )
}
