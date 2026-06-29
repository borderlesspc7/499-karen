import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BrainCircuit, Inbox, LayoutGrid, Link2, TrendingUp, Wand2 } from 'lucide-react-native'

const VISIBLE_TABS = [
  'index',
  'opportunities',
  'workforce',
  'integrations',
  'campaign-magic',
  'inbox',
] as const

type VisibleTabName = (typeof VISIBLE_TABS)[number]

const TAB_CONFIG: Record<
  VisibleTabName,
  { label: string; Icon: typeof LayoutGrid }
> = {
  index: { label: 'Home', Icon: LayoutGrid },
  opportunities: { label: 'CRM', Icon: TrendingUp },
  workforce: { label: 'Equipe IA', Icon: BrainCircuit },
  integrations: { label: 'Canais', Icon: Link2 },
  'campaign-magic': { label: 'Campanhas', Icon: Wand2 },
  inbox: { label: 'Inbox', Icon: Inbox },
}

export function SummusBottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="border-t border-white/10 bg-deepBlue"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-center justify-around px-2 pt-2">
        {VISIBLE_TABS.map((tabName) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tabName)
          const isFocused = state.index === routeIndex
          const config = TAB_CONFIG[tabName]
          const Icon = config.Icon
          const iconColor = isFocused ? '#F59E0B' : '#64748B'
          const labelColor = isFocused ? 'text-gold' : 'text-slate-500'

          return (
            <Pressable
              key={tabName}
              onPress={() => {
                if (!isFocused && routeIndex !== -1) {
                  navigation.navigate(tabName)
                }
              }}
              className="min-w-0 flex-1 items-center gap-1 rounded-2xl py-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              <View
                className={[
                  'items-center justify-center rounded-2xl px-4 py-1.5',
                  isFocused ? 'bg-white/10' : 'bg-transparent',
                ].join(' ')}
              >
                <Icon size={20} color={iconColor} strokeWidth={isFocused ? 2.25 : 2} />
              </View>
              <Text className={['text-[10px] font-semibold', labelColor].join(' ')}>
                {config.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
