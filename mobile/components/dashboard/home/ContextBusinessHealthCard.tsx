import { Text, View } from 'react-native'
import { Activity } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import type { BusinessHealthScores } from '@shared/types/gamification'

type HealthCategory = {
  key: keyof Omit<BusinessHealthScores, 'totalScore'>
  labelKey: 'home.marketing' | 'home.sales' | 'home.automation' | 'home.credibility' | 'home.positioning'
}

const HEALTH_CATEGORIES: HealthCategory[] = [
  { key: 'marketing', labelKey: 'home.marketing' },
  { key: 'vendas', labelKey: 'home.sales' },
  { key: 'automacao', labelKey: 'home.automation' },
  { key: 'credibilidade', labelKey: 'home.credibility' },
  { key: 'posicionamento', labelKey: 'home.positioning' },
]

function resolveBarColor(value: number): string {
  if (value >= 70) {
    return '#10B981'
  }

  if (value >= 40) {
    return '#F59E0B'
  }

  return '#EF4444'
}

type ContextBusinessHealthCardProps = {
  businessHealth: BusinessHealthScores
}

export function ContextBusinessHealthCard({ businessHealth }: ContextBusinessHealthCardProps) {
  const { t } = useTranslation()

  return (
    <View
      className="rounded-3xl bg-white/95 p-6"
      style={{
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Activity size={18} color="#3B82F6" />
        <Text className="text-base font-bold text-deepBlue">{t('home.businessHealthScore')}</Text>
      </View>

      <View className="mt-5 items-center">
        <Text className="text-5xl font-bold text-deepBlue">
          {businessHealth.totalScore}
          <Text className="text-2xl font-semibold text-deepBlue/30">/100</Text>
        </Text>
      </View>

      <View className="mt-6 gap-3">
        {HEALTH_CATEGORIES.map((category) => {
          const value = businessHealth[category.key]

          return (
            <View key={category.key}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs font-medium text-deepBlue/70">{t(category.labelKey)}</Text>
                <Text className="text-xs font-bold text-deepBlue">{value}%</Text>
              </View>
              <View className="h-1.5 overflow-hidden rounded-full bg-deepBlue/10">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${value}%`, backgroundColor: resolveBarColor(value) }}
                />
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
