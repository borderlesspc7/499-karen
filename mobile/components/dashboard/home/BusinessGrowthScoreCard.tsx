import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { ChevronDown, ChevronUp, Sparkles, TrendingUp } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'

type ScoreCategory = {
  label: string
  value: number
  color: string
}

const OVERALL_SCORE = 92
const MAX_SCORE = 100

function ScoreRing({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <View className="h-36 w-36 items-center justify-center rounded-full border-[10px] border-deepBlue/10">
      <View
        className="absolute h-36 w-36 rounded-full border-[10px] border-emerald"
        style={{
          borderRightColor: 'transparent',
          borderBottomColor: percentage > 25 ? '#10B981' : 'transparent',
          borderLeftColor: percentage > 50 ? '#10B981' : 'transparent',
          borderTopColor: percentage > 75 ? '#10B981' : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <Text className="text-4xl font-bold text-deepBlue">
        {score}
        <Text className="text-xl font-medium text-deepBlue/40">/{maxScore}</Text>
      </Text>
    </View>
  )
}

function CategoryBar({ label, value, color }: ScoreCategory) {
  return (
    <View>
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-deepBlue">{label}</Text>
        <Text className="text-sm font-bold text-deepBlue">{value}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-deepBlue/10">
        <View className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </View>
    </View>
  )
}

export function BusinessGrowthScoreCard() {
  const { t } = useTranslation()
  const [isScoreExpanded, setIsScoreExpanded] = useState(false)

  const scoreCategories: ScoreCategory[] = [
    { label: t('home.site'), value: 90, color: '#10B981' },
    { label: t('home.branding'), value: 60, color: '#F59E0B' },
    { label: t('home.seo'), value: 30, color: '#EF4444' },
  ]

  return (
    <Pressable
      onPress={() => setIsScoreExpanded((current) => !current)}
      className="rounded-3xl bg-white p-6 active:opacity-95"
      style={{
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={18} color="#10B981" />
          <Text className="text-lg font-bold text-deepBlue">{t('home.businessGrowthScore')}</Text>
        </View>
        {isScoreExpanded ? (
          <ChevronUp size={20} color="#64748B" />
        ) : (
          <ChevronDown size={20} color="#64748B" />
        )}
      </View>

      <Text className="mt-1 text-sm text-deepBlue/50">{t('home.tapToSeeScore')}</Text>

      <View className="mt-6 items-center">
        <ScoreRing score={OVERALL_SCORE} maxScore={MAX_SCORE} />
      </View>

      {isScoreExpanded ? (
        <View className="mt-6 gap-4">
          {scoreCategories.map((category) => (
            <CategoryBar key={category.label} {...category} />
          ))}

          <View className="mt-2 flex-row gap-3 rounded-2xl border border-electricBlue/20 bg-electricBlue/5 p-4">
            <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl bg-electricBlue/15">
              <Sparkles size={16} color="#3B82F6" />
            </View>
            <Text className="flex-1 text-sm leading-5 text-deepBlue">
              {t('home.nextLevelSeo')}{' '}
              <Text className="font-bold text-electricBlue">{t('home.doItNow')}</Text>
            </Text>
          </View>
        </View>
      ) : (
        <View className="mt-6">
          <View className="h-3 overflow-hidden rounded-full bg-deepBlue/10">
            <View
              className="h-full rounded-full bg-emerald"
              style={{ width: `${OVERALL_SCORE}%` }}
            />
          </View>
          <Text className="mt-2 text-center text-xs text-deepBlue/40">{t('home.quarterGoal')}</Text>
        </View>
      )}
    </Pressable>
  )
}
