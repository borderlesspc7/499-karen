import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { GROWTH_ACTIONS } from '@shared/constants/growth-actions'
import { useGamification } from '@shared/contexts'
import { AiCoachMissionCard } from '@/components/dashboard/home/AiCoachMissionCard'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const IMPACT_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  vendas: 'Vendas',
  automacao: 'Automação',
  credibilidade: 'Credibilidade',
  posicionamento: 'Posicionamento',
}

export default function AiCoachScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { completeMission, timeline } = useGamification()

  const suggestedMissions = useMemo(() => {
    const completedActionIds = new Set(timeline.map((entry) => entry.actionId))

    return Object.entries(GROWTH_ACTIONS)
      .filter(([actionId]) => !completedActionIds.has(actionId))
      .slice(0, 3)
      .map(([actionId, action]) => ({
        id: actionId,
        title: action.title,
        impact: `+${action.xpReward} XP · ${IMPACT_LABELS[action.impactCategory] ?? action.impactCategory}`,
      }))
  }, [timeline])

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
          <Text className={['text-3xl font-bold', tc.textPrimary].join(' ')}>AI Coach</Text>
          <Text className={['text-sm', tc.textSecondary].join(' ')}>
            Missões proativas geradas pela IA para acelerar o seu crescimento.
          </Text>
        </View>

        <AiCoachMissionCard onResolveMission={completeMission} />

        <View className="gap-3">
          <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>
            Próximas missões sugeridas
          </Text>
          {suggestedMissions.length === 0 ? (
            <Text className={['text-sm', tc.textSecondary].join(' ')}>
              Todas as missões disponíveis foram concluídas. Novas serão geradas conforme sua operação evoluir.
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
