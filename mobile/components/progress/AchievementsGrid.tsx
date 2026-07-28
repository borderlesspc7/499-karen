import { Text, View } from 'react-native'
import { Lock, Medal } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import { ACHIEVEMENTS } from '@/constants/achievements'
import type { UserGamificationState } from '@shared/types/gamification'

type AchievementsGridProps = {
  gamificationState: UserGamificationState
}

export function AchievementsGrid({ gamificationState }: AchievementsGridProps) {
  const { t } = useTranslation()
  const unlockedCount = ACHIEVEMENTS.filter((item) => item.isUnlocked(gamificationState)).length

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">{t('progress.achievementsWall')}</Text>
        <View className="rounded-full bg-gold/15 px-2.5 py-1">
          <Text className="text-xs font-bold text-gold">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = achievement.isUnlocked(gamificationState)
          const Icon = achievement.icon

          return (
            <View
              key={achievement.id}
              className={[
                'w-[30%] grow items-center rounded-3xl border p-4',
                isUnlocked
                  ? 'border-gold/40 bg-gold/10'
                  : 'border-white/10 bg-white/5 opacity-50',
              ].join(' ')}
            >
              <View className="relative">
                <View
                  className={[
                    'h-14 w-14 items-center justify-center rounded-2xl',
                    isUnlocked ? 'bg-gold/20' : 'bg-white/10',
                  ].join(' ')}
                >
                  <Icon size={26} color={isUnlocked ? '#F59E0B' : '#64748B'} />
                </View>

                {isUnlocked ? (
                  <View className="absolute -right-1 -top-1 rounded-full bg-gold p-0.5">
                    <Medal size={12} color="#0F172A" />
                  </View>
                ) : (
                  <View className="absolute -right-1 -top-1 rounded-full bg-deepBlue/90 p-1">
                    <Lock size={10} color="#94A3B8" />
                  </View>
                )}
              </View>

              <Text
                className={[
                  'mt-3 text-center text-xs font-bold',
                  isUnlocked ? 'text-gold' : 'text-white/40',
                ].join(' ')}
                numberOfLines={2}
              >
                {t(achievement.titleKey)}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
