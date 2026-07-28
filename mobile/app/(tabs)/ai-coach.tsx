import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { GROWTH_ACTIONS } from '@shared/constants/growth-actions'
import { useGamification, useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import { AiCoachMissionCard } from '@/components/dashboard/home/AiCoachMissionCard'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const IMPACT_LABEL_KEYS: Record<string, TranslationKey> = {
  marketing: 'home.marketing',
  vendas: 'home.sales',
  automacao: 'home.automation',
  credibilidade: 'home.credibility',
  posicionamento: 'home.positioning',
}

export default function AiCoachScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { t } = useTranslation()
  const { completeMission, timeline } = useGamification()

  const suggestedMissions = useMemo(() => {
    const completedActionIds = new Set(timeline.map((entry) => entry.actionId))

    return Object.entries(GROWTH_ACTIONS)
      .filter(([actionId]) => !completedActionIds.has(actionId))
      .slice(0, 3)
      .map(([actionId, action]) => {
        const labelKey = IMPACT_LABEL_KEYS[action.impactCategory]
        const label = labelKey ? t(labelKey) : action.impactCategory
        return {
          id: actionId,
          title: t(action.titleKey),
          impact: t('home.missionXp', { xp: action.xpReward, label }),
        }
      })
  }, [t, timeline])

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-4',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>
            {t('placeholders.aiCoachTitle')}
          </Text>
          <Text className={['text-sm', tc.textSecondary].join(' ')}>
            {t('placeholders.aiCoachDesc')}
          </Text>
        </View>

        <AiCoachMissionCard onResolveMission={completeMission} />

        <View className="gap-3">
          <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>
            {t('placeholders.nextMissions')}
          </Text>
          {suggestedMissions.length === 0 ? (
            <Text className={['text-sm', tc.textSecondary].join(' ')}>
              {t('placeholders.allMissionsDone')}
            </Text>
          ) : null}
          {suggestedMissions.map((mission) => (
            <View key={mission.id} className={['p-4', tc.cardLg].join(' ')}>
              <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
                {mission.title}
              </Text>
              <Text className="mt-1 text-xs font-medium text-gold">{mission.impact}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedScreen>
  )
}
