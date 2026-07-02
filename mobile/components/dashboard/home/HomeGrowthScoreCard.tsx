import { Text, View } from 'react-native'
import { TrendingUp } from 'lucide-react-native'
import type { CompanyStage } from '@shared/types/gamification'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type HomeGrowthScoreCardProps = {
  score: number
  companyStage: CompanyStage
}

const MAX_SCORE = 100

function resolveStagePercentile(score: number): number {
  return Math.min(95, Math.max(8, Math.round(score * 0.93)))
}

export function HomeGrowthScoreCard({ score, companyStage }: HomeGrowthScoreCardProps) {
  const tc = useThemeClasses()
  const percentile = resolveStagePercentile(score)

  return (
    <View className={['p-6', tc.card].join(' ')} style={tc.cardShadow}>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-card bg-emerald/10">
          <TrendingUp size={16} color={premiumColors.emerald} strokeWidth={2} />
        </View>
        <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
          Business Growth Score
        </Text>
      </View>

      <View className="mt-5 flex-row items-end gap-2">
        <Text className={['text-5xl font-bold tracking-tight', tc.textPrimary].join(' ')}>{score}</Text>
        <Text className={['mb-1.5 text-2xl font-medium', tc.isDark ? 'text-white/25' : 'text-navy/25'].join(' ')}>
          /{MAX_SCORE}
        </Text>
      </View>

      <View className={['mt-4 h-2 overflow-hidden rounded-full', tc.progressTrack].join(' ')}>
        <View className="h-full rounded-full bg-gold" style={{ width: `${score}%` }} />
      </View>

      <View className={['mt-4 px-4 py-3', tc.highlightBox].join(' ')}>
        <Text className={['text-sm leading-6', tc.textLabel].join(' ')}>
          Sua empresa está mais avançada que{' '}
          <Text className={['font-semibold', tc.textPrimary].join(' ')}>{percentile}%</Text> das empresas do seu
          estágio <Text className="font-semibold text-gold">{companyStage}</Text>.
        </Text>
      </View>
    </View>
  )
}
