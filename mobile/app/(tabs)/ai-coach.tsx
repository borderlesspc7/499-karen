import { ScrollView, Text, View } from 'react-native'
import { useGamification } from '@shared/contexts'
import { AiCoachMissionCard } from '@/components/dashboard/home/AiCoachMissionCard'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

const SUGGESTED_MISSIONS = [
  {
    id: 'mission-1',
    title: 'Otimizar headline do site',
    impact: '+8 Posicionamento',
  },
  {
    id: 'mission-2',
    title: 'Reativar leads inativos',
    impact: '+6 Vendas',
  },
  {
    id: 'mission-3',
    title: 'Publicar artigo de SEO',
    impact: '+5 Credibilidade',
  },
]

export default function AiCoachScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { completeMission } = useGamification()

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
          {SUGGESTED_MISSIONS.map((mission) => (
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
