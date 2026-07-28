import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useAuth, useTranslation } from '@shared/contexts'

type SidebarUserProfileProps = {
  displayName?: string
}

function resolveUserName(email: string | null | undefined, fallback: string): string {
  if (!email) return fallback
  const localPart = email.split('@')[0] ?? fallback
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
  const { t } = useTranslation()
  const name = displayName ?? resolveUserName(currentUser?.email, t('common.user'))
  const initials = resolveInitials(name)

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel={t('profile.openProfileA11y')}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
        <Text className="text-xs font-bold text-gold">{initials}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-white" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-white/45">Meridian</Text>
      </View>
    </Pressable>
  )
}
