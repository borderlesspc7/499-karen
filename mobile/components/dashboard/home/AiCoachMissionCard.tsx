import { Alert, Pressable, Text, View } from 'react-native'
import { Bot, Sparkles, Target, Zap } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import type { MissionImpactCategory } from '@shared/types/gamification'

type AiCoachMissionCardProps = {
  onResolveMission: (
    xpReward: number,
    coinReward: number,
    impactCategory: MissionImpactCategory,
    impactValue: number,
  ) => void
}

const MISSION_XP_REWARD = 120
const MISSION_COIN_REWARD = 25
const MISSION_IMPACT_CATEGORY: MissionImpactCategory = 'posicionamento'
const MISSION_IMPACT_VALUE = 8

export function AiCoachMissionCard({ onResolveMission }: AiCoachMissionCardProps) {
  const { t } = useTranslation()

  function handleResolveMission() {
    onResolveMission(
      MISSION_XP_REWARD,
      MISSION_COIN_REWARD,
      MISSION_IMPACT_CATEGORY,
      MISSION_IMPACT_VALUE,
    )

    Alert.alert(t('home.missionRunning'), t('home.missionRunningBody'))
  }

  return (
    <View
      className="overflow-hidden rounded-3xl border-2 border-gold/50 bg-[#131F35] p-6"
      style={{
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-electricBlue/10" />
      <View className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-gold/10" />

      <View className="flex-row items-center gap-2">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-electricBlue/20">
          <Bot size={22} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
            {t('home.maxPriority')}
          </Text>
          <Text className="text-lg font-bold text-white">{t('home.coachWhatNow')}</Text>
        </View>
        <Sparkles size={18} color="#F59E0B" />
      </View>

      <Text className="mt-4 text-base leading-6 text-white/85">{t('home.missionCtaSite')}</Text>

      <View className="mt-4 flex-row items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
        <Target size={14} color="#F59E0B" />
        <Text className="text-xs font-semibold text-gold">
          {t('home.impactPositioning', { points: String(MISSION_IMPACT_VALUE) })}
        </Text>
      </View>

      <Pressable
        onPress={handleResolveMission}
        className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-electricBlue py-4 active:opacity-80"
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
        <Text className="text-base font-bold text-white">{t('home.resolveNow')}</Text>
      </Pressable>
    </View>
  )
}
