import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useGamification } from '@shared/contexts'

type GamificationProfileCardProps = {
  displayName?: string
  planLabel?: string
}

function formatXp(value: number): string {
  return value.toLocaleString('en-US')
}

export function GamificationProfileCard({
  displayName = 'Sarah Johnson',
  planLabel = 'Elite Plan',
}: GamificationProfileCardProps) {
  const { level, currentXp, maxXp, xpProgress } = useGamification()
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      className="rounded-3xl border border-white/10 bg-deepBlue p-4 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel="Abrir área do usuário"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-gold/40 bg-white/10">
          <Text className="text-sm font-bold text-gold">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">{displayName}</Text>
          <View className="mt-1 self-start rounded-full bg-gold/15 px-2 py-0.5">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-gold">
              {planLabel}
            </Text>
          </View>
        </View>
      </View>

      <Text className="mt-4 text-xs font-semibold text-white">
        Level {level}
      </Text>

      <View className="mt-2.5">
        <View className="h-2 overflow-hidden rounded-full bg-white/10">
          <View
            className="h-full rounded-full bg-gold"
            style={{ width: `${Math.round(xpProgress * 100)}%` }}
          />
        </View>
        <Text className="mt-1.5 text-[10px] font-medium text-white/50">
          {formatXp(currentXp)} / {formatXp(maxXp)} XP
        </Text>
      </View>
    </Pressable>
  )
}
