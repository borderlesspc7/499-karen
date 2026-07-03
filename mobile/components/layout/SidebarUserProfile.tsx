import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@shared/contexts'

type SidebarUserProfileProps = {
  displayName?: string
}

function resolveUserName(email?: string | null): string {
  if (!email) return 'Karen Lee'
  const localPart = email.split('@')[0] ?? 'Karen'
  const formatted = localPart.charAt(0).toUpperCase() + localPart.slice(1)
  return formatted.includes(' ') ? formatted : `${formatted} Lee`
}

function resolveInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function SidebarUserProfile({ displayName }: SidebarUserProfileProps) {
  const { currentUser } = useAuth()
  const name = displayName ?? resolveUserName(currentUser?.email)
  const initials = resolveInitials(name)

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel="Abrir perfil"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
        <Text className="text-xs font-bold text-gold">{initials}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-white" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-white/45">Summus Edge</Text>
      </View>
    </Pressable>
  )
}
