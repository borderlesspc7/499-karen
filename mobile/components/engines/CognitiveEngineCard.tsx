import { Alert, Pressable, Text, View } from 'react-native'
import type { CognitiveEngine } from '@/constants/cognitive-engines'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type CognitiveEngineCardProps = {
  engine: CognitiveEngine
  onEngage?: (engineId: string) => void
}

export function CognitiveEngineCard({ engine, onEngage }: CognitiveEngineCardProps) {
  const tc = useThemeClasses()
  const Icon = engine.icon

  function handleEngage() {
    onEngage?.(engine.id)
    Alert.alert(
      engine.name,
      `${engine.namePt} continua operando em segundo plano. Sua próxima interação já passa por este motor.`,
    )
  }

  return (
    <View className={['p-5', tc.cardLg].join(' ')} style={tc.cardShadow}>
      <View className="flex-row items-start gap-4">
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${engine.accentColor}18` }}
        >
          <Icon size={26} color={engine.accentColor} />
        </View>

        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className={['text-base font-bold', tc.textPrimary].join(' ')}>
              {engine.name}
            </Text>
            <View className="rounded-full bg-emerald/10 px-2 py-0.5">
              <Text className="text-[10px] font-bold uppercase tracking-wide text-emerald">
                Sempre ativo
              </Text>
            </View>
          </View>
          <Text className={['mt-0.5 text-xs font-semibold', tc.textMuted].join(' ')}>
            {engine.namePt}
          </Text>
          <Text className={['mt-2 text-sm leading-5', tc.textSecondary].join(' ')}>
            {engine.objective}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {engine.searchesFor.slice(0, 4).map((item) => (
          <View
            key={item}
            className={['rounded-full px-2.5 py-1', tc.surfaceMuted].join(' ')}
          >
            <Text className={['text-[11px] font-medium', tc.textLabel].join(' ')}>{item}</Text>
          </View>
        ))}
      </View>

      <View
        className={['mt-4 rounded-2xl border px-4 py-3', tc.isDark ? 'border-white/10 bg-white/5' : 'border-premiumBorder bg-white'].join(' ')}
      >
        <Text className="text-xs font-semibold uppercase tracking-wider text-gold">
          {engine.alwaysOnCopy}
        </Text>
        <Text className={['mt-1.5 text-sm leading-5', tc.textSecondary].join(' ')}>
          {engine.recentSignal}
        </Text>
      </View>

      <Pressable
        onPress={handleEngage}
        className="mt-4 rounded-2xl py-3.5 active:opacity-90"
        style={{ backgroundColor: engine.accentColor }}
      >
        <Text className="text-center text-sm font-bold text-white">Ver sinais deste motor</Text>
      </Pressable>
    </View>
  )
}
