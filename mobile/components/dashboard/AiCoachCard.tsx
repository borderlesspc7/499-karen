import { Pressable, Text, View } from 'react-native'
import { Bot, ChevronRight, FileText, TrendingDown, Users } from 'lucide-react-native'
import { premiumColors } from '@/constants/premium-theme'
import { dashboardMockData } from '@/constants/dashboard-mock-data'

const actionIcons = {
  users: Users,
  file: FileText,
  trend: TrendingDown,
} as const

type AiCoachCardProps = {
  isDesktop: boolean
}

export function AiCoachCard({ isDesktop }: AiCoachCardProps) {
  const { opportunitiesCount, potentialRevenue, quickActions } = dashboardMockData.aiCoach

  return (
    <View
      className={[
        'overflow-hidden rounded-3xl border border-summus-700',
        isDesktop ? 'flex-row' : '',
      ].join(' ')}
      style={{ backgroundColor: premiumColors.navy }}
    >
      {/* Glow accent */}
      <View
        className="absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-30"
        style={{ backgroundColor: '#4C1D95' }}
      />

      <View className={['relative z-10 p-6', isDesktop ? 'flex-1 justify-center' : ''].join(' ')}>
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/25">
          <Bot size={28} color="#A78BFA" />
        </View>

        <Text className="text-sm leading-6 text-slate-300">
          You have {opportunitiesCount} high-impact opportunities today.
        </Text>
        <Text className="mt-2 text-4xl font-bold text-gold-400">
          ${potentialRevenue.toLocaleString('en-US')}
        </Text>
        <Text className="mt-1 text-xs font-medium text-slate-400">Potential impact</Text>

        <Pressable className="mt-5 self-start rounded-xl bg-gold-500 px-6 py-3 active:bg-gold-400">
          <Text className="text-sm font-bold text-summus-950">Show Me</Text>
        </Pressable>
      </View>

      <View
        className={[
          'relative z-10 gap-2 p-4',
          isDesktop ? 'w-[300px] justify-center border-l border-summus-700/80' : 'border-t border-summus-700/80',
        ].join(' ')}
      >
        {quickActions.map((action) => {
          const Icon = actionIcons[action.icon]
          const iconBg = action.icon === 'trend' ? 'bg-amber-50' : 'bg-emerald-50'
          const iconColor = action.icon === 'trend' ? '#D97706' : '#059669'

          return (
            <Pressable
              key={action.id}
              className="flex-row items-center gap-3 rounded-2xl bg-white p-3.5 active:bg-slate-50"
            >
              <View className={`rounded-xl p-2 ${iconBg}`}>
                <Icon size={16} color={iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold leading-5 text-slate-900">{action.title}</Text>
                <Text className="mt-0.5 text-xs text-slate-500">{action.subtitle}</Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
