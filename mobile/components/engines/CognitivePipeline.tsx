import { Text, View } from 'react-native'
import { COGNITIVE_PIPELINE } from '@/constants/cognitive-engines'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type CognitivePipelineProps = {
  compact?: boolean
}

export function CognitivePipeline({ compact = false }: CognitivePipelineProps) {
  const tc = useThemeClasses()

  return (
    <View className={['p-5', tc.cardLg].join(' ')} style={tc.cardShadow}>
      <Text className={['text-xs font-bold uppercase tracking-wider text-gold'].join(' ')}>
        Pipeline do Núcleo
      </Text>
      <Text className={['mt-1 text-base font-bold', tc.textPrimary].join(' ')}>
        Um único cérebro
      </Text>
      {!compact ? (
        <Text className={['mt-1 text-sm leading-5', tc.textSecondary].join(' ')}>
          Não existem módulos separados. Todo processamento passa por este pipeline.
        </Text>
      ) : null}

      <View className="mt-5 gap-0">
        {COGNITIVE_PIPELINE.map((stage, index) => {
          const isLast = index === COGNITIVE_PIPELINE.length - 1
          return (
            <View key={stage.id} className="flex-row gap-3">
              <View className="items-center">
                <View className="h-2.5 w-2.5 rounded-full bg-gold" />
                {!isLast ? (
                  <View className={['my-1 w-px flex-1 min-h-[20px]', tc.connectorLine].join(' ')} />
                ) : null}
              </View>
              <View className={isLast ? 'pb-0' : 'pb-3'}>
                <Text className={['text-sm font-semibold', tc.textPrimary].join(' ')}>
                  {stage.label}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
