import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BrainCircuit, Inbox, LayoutGrid, Link2, TrendingUp, Wand2 } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

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
  { labelKey: TranslationKey; Icon: typeof LayoutGrid }
> = {
  index: { labelKey: 'nav.meridian', Icon: LayoutGrid },
  opportunities: { labelKey: 'nav.opportunities', Icon: TrendingUp },
  workforce: { labelKey: 'nav.engines', Icon: BrainCircuit },
  integrations: { labelKey: 'nav.channels', Icon: Link2 },
  'campaign-magic': { labelKey: 'nav.campaigns', Icon: Wand2 },
  inbox: { labelKey: 'nav.inbox', Icon: Inbox },
}

export function SummusBottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const tc = useThemeClasses()
  const { t } = useTranslation()

  return (
    <View
      className={tc.tabBarClass}
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-center justify-around px-2 pt-2">
        {VISIBLE_TABS.map((tabName) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tabName)
          const isFocused = state.index === routeIndex
          const config = TAB_CONFIG[tabName]
          const Icon = config.Icon
          const iconColor = isFocused ? premiumColors.gold : tc.inactiveTabIcon
          const labelColor = isFocused ? 'text-gold' : tc.isDark ? 'text-slate-500' : 'text-slate-400'

          return (
            <Pressable
              key={tabName}
              onPress={() => {
                if (!isFocused && routeIndex !== -1) {
                  navigation.navigate(tabName)
                }
              }}
              className="min-w-0 flex-1 items-center gap-1 rounded-card py-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              <View
                className={[
                  'items-center justify-center rounded-card px-4 py-1.5',
                  isFocused ? tc.activeTabContainer : 'bg-transparent',
                ].join(' ')}
              >
                <Icon size={20} color={iconColor} strokeWidth={isFocused ? 2 : 1.5} />
              </View>
              <Text className={['text-[10px] font-semibold tracking-wide', labelColor].join(' ')}>
                {t(config.labelKey)}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
