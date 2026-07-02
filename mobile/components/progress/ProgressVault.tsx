import { ScrollView, Text, View } from 'react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { Sparkles, TrendingUp } from 'lucide-react-native'
import { useGamification } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { AchievementsGrid } from './AchievementsGrid'
import { ProgressTimeline } from './ProgressTimeline'

export function ProgressVault() {
  const { isWebDesktop } = useResponsiveLayout()
  const gamification = useGamification()
  const { recentActivity, companyTier, level, economy } = gamification

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-8 pb-10 pt-4',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="self-start flex-row items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
            <Sparkles size={14} color="#F59E0B" />
            <Text className="text-xs font-bold uppercase tracking-wider text-gold">
              Evolução & Conquistas
            </Text>
          </View>

          <Text className="text-3xl font-bold text-white">Progress Vault</Text>
          <Text className="text-sm leading-5 text-white/60">
            Acompanhe cada passo da sua jornada e desbloqueie conquistas exclusivas.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Text className="text-xs text-white/50">Nível</Text>
            <Text className="mt-1 text-xl font-bold text-gold">Level {level}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Text className="text-xs text-white/50">Tier</Text>
            <Text className="mt-1 text-sm font-bold text-white">{companyTier}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Text className="text-xs text-white/50">Moedas</Text>
            <Text className="mt-1 text-xl font-bold text-gold">{economy.coins}</Text>
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <TrendingUp size={18} color="#3B82F6" />
            <Text className="text-lg font-bold text-white">Timeline de Progresso</Text>
          </View>
          <ProgressTimeline activities={recentActivity} />
        </View>

        <AchievementsGrid gamificationState={gamification} />
      </ScrollView>
    </ThemedScreen>
  )
}
