import { Text, View } from 'react-native'
import { LiveAiActivity } from '@/components/dashboard/home/LiveAiActivity'
import { AiWorkforceOrb } from '@/components/revenue-center/AiWorkforceOrb'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type AiWorkforcePanelProps = {
  isLiveReveal?: boolean
}

export function AiWorkforcePanel({ isLiveReveal = false }: AiWorkforcePanelProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>
          Núcleo Cognitivo em operação
        </Text>
        <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>
          Context, Decision e Blind Spot rodando em paralelo — você vê só a resposta integrada.
        </Text>
      </View>

      {isWebDesktop ? (
        <View
          className={['flex-row overflow-hidden rounded-3xl border', tc.glassCard].join(' ')}
          style={tc.cardShadow}
        >
          <View className={['min-w-0 flex-[3] p-2', tc.isDark ? 'border-r border-white/5' : 'border-r border-premiumBorder'].join(' ')}>
            <LiveAiActivity isLiveReveal={isLiveReveal} embedded />
          </View>
          <View className="min-w-0 flex-[2] items-center justify-center bg-navy/30 px-4">
            <AiWorkforceOrb />
          </View>
        </View>
      ) : (
        <View className="gap-4">
          <AiWorkforceOrb compact />
          <LiveAiActivity isLiveReveal={isLiveReveal} />
        </View>
      )}
    </View>
  )
}
