import { ScrollView, Text, View } from 'react-native'
import { Brain } from 'lucide-react-native'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { CognitiveEngineCard } from '@/components/engines/CognitiveEngineCard'
import { CognitivePipeline } from '@/components/engines/CognitivePipeline'
import {
  COGNITIVE_CORE_COPY,
  COGNITIVE_ENGINES,
  ENGINE_ACTION_MAP,
  FUTURE_COGNITIVE_ENGINES,
  type CognitiveEngineId,
} from '@/constants/cognitive-engines'
import { useGamification } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export default function WorkforceScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const { executeAction } = useGamification()

  function handleEngage(engineId: string) {
    const actionId = ENGINE_ACTION_MAP[engineId as CognitiveEngineId]
    if (actionId) {
      executeAction(actionId)
    }
  }

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-6',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="self-start flex-row items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-2">
            <Brain size={14} color="#C5A059" />
            <Text className="text-xs font-bold uppercase tracking-wider text-gold">
              {COGNITIVE_CORE_COPY.badge}
            </Text>
          </View>

          <Text className={['text-3xl font-bold tracking-tight', tc.textPrimary].join(' ')}>
            {COGNITIVE_CORE_COPY.title}
          </Text>
          <Text className={['text-base leading-6', tc.textSecondary].join(' ')}>
            {COGNITIVE_CORE_COPY.subtitle}
          </Text>
          <Text className={['text-sm font-medium leading-5 text-gold'].join(' ')}>
            {COGNITIVE_CORE_COPY.notChatbot}
          </Text>
        </View>

        <CognitivePipeline />

        <View className="gap-2">
          <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>
            {COGNITIVE_CORE_COPY.alwaysOn}
          </Text>
          <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
            {COGNITIVE_CORE_COPY.userSeesOne}
          </Text>
        </View>

        <View className="gap-4">
          {COGNITIVE_ENGINES.map((engine) => (
            <CognitiveEngineCard
              key={engine.id}
              engine={engine}
              onEngage={handleEngage}
            />
          ))}
        </View>

        <View className="gap-3">
          <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>
            {COGNITIVE_CORE_COPY.futureTitle}
          </Text>
          <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
            {COGNITIVE_CORE_COPY.futureSubtitle}
          </Text>
          <View className="gap-3">
            {FUTURE_COGNITIVE_ENGINES.map((engine) => {
              const Icon = engine.icon
              return (
                <View
                  key={engine.id}
                  className={[
                    'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
                    tc.isDark ? 'border-white/10 bg-white/5' : 'border-premiumBorder bg-white',
                  ].join(' ')}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                    <Icon size={18} color="#C5A059" />
                  </View>
                  <View className="flex-1">
                    <Text className={['text-sm font-bold', tc.textPrimary].join(' ')}>
                      {engine.name}
                    </Text>
                    <Text className={['mt-0.5 text-xs leading-4', tc.textMuted].join(' ')}>
                      {engine.description}
                    </Text>
                  </View>
                  <View className="rounded-full bg-white/5 px-2 py-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-gold/80">
                      Em breve
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </ScrollView>
    </ThemedScreen>
  )
}
