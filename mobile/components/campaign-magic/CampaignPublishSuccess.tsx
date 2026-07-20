import { useEffect } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated'
import { CheckCircle2 } from 'lucide-react-native'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { platformEntering } from '@/lib/platform-animation'

export type PublishChannelStatus = {
  id: string
  name: string
  published: boolean
}

type CampaignPublishSuccessProps = {
  visible: boolean
  channels: PublishChannelStatus[]
  estimatedLeads: number
  hoursSaved: number
  expectedRoi: number
  onClose: () => void
  onGoHome?: () => void
  autoCloseMs?: number
}

export function CampaignPublishSuccess({
  visible,
  channels,
  estimatedLeads,
  hoursSaved,
  expectedRoi,
  onClose,
  onGoHome,
  autoCloseMs = 6000,
}: CampaignPublishSuccessProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [visible, autoCloseMs, onClose])

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View
        className={[
          'flex-1 items-center justify-center px-6',
          tc.isDark ? 'bg-navy/95' : 'bg-white/95',
        ].join(' ')}
      >
        <ConfettiBurst active={visible} />

        <Animated.View
          entering={platformEntering(FadeInDown.duration(500))}
          className={[
            'w-full gap-8 p-8',
            isWebDesktop ? 'max-w-lg' : 'max-w-md',
            tc.heroCard,
          ].join(' ')}
          style={tc.cardShadow}
        >
          <View className="items-center gap-3">
            <Animated.View entering={platformEntering(ZoomIn.delay(200).duration(400))}>
              <CheckCircle2 size={48} color={premiumColors.emerald} strokeWidth={1.5} />
            </Animated.View>
            <Text className={['text-center text-2xl font-bold', tc.textPrimary].join(' ')}>
              Campanha publicada com sucesso
            </Text>
            <Text className={['text-center text-sm', tc.textSecondary].join(' ')}>
              em {channels.filter((c) => c.published).length} canais
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-center gap-3">
            {channels.map((channel, index) => (
              <Animated.View
                key={channel.id}
                entering={platformEntering(FadeIn.delay(300 + index * 120).duration(350))}
                className={[
                  'flex-row items-center gap-2 rounded-full border px-4 py-2',
                  channel.published
                    ? 'border-emerald/30 bg-emerald/10'
                    : tc.filterInactive,
                ].join(' ')}
              >
                <Text className={['text-sm font-medium', tc.textPrimary].join(' ')}>
                  {channel.name}
                </Text>
                {channel.published ? (
                  <Text className="text-sm font-bold text-emerald">✓</Text>
                ) : null}
              </Animated.View>
            ))}
          </View>

          <View className={['h-px w-full', tc.isDark ? 'bg-white/10' : 'bg-slate-200'].join(' ')} />

          <View className="flex-row gap-3">
            <KpiCard
              label="Estimativa"
              value={estimatedLeads}
              suffix=" leads"
              delay={600}
              tc={tc}
            />
            <KpiCard
              label="Economia"
              value={hoursSaved}
              suffix=" horas"
              delay={750}
              tc={tc}
            />
            <KpiCard
              label="ROI previsto"
              value={expectedRoi}
              suffix="x"
              delay={900}
              formatter={(v) => v.toFixed(1)}
              tc={tc}
            />
          </View>

          <View className={['h-px w-full', tc.isDark ? 'bg-white/10' : 'bg-slate-200'].join(' ')} />

          <View className="gap-3">
            <Pressable
              onPress={onClose}
              className="rounded-2xl bg-gold py-4 active:opacity-90"
            >
              <Text className="text-center text-base font-bold text-deepBlue">
                Ver campanhas ativas
              </Text>
            </Pressable>
            {onGoHome ? (
              <Pressable onPress={onGoHome} className="rounded-2xl py-3 active:opacity-70">
                <Text className={['text-center text-sm font-semibold', tc.textSecondary].join(' ')}>
                  Ir para o Núcleo Cognitivo
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

function KpiCard({
  label,
  value,
  suffix = '',
  delay,
  formatter,
  tc,
}: {
  label: string
  value: number
  suffix?: string
  delay: number
  formatter?: (v: number) => string
  tc: ReturnType<typeof useThemeClasses>
}) {
  return (
    <Animated.View
      entering={platformEntering(FadeInDown.delay(delay).duration(400))}
      className={['min-w-0 flex-1 items-center gap-1 rounded-2xl p-4', tc.surfaceMuted].join(' ')}
    >
      <AnimatedCounter
        value={value}
        formatter={(v) => `${formatter ? formatter(v) : Math.round(v).toString()}${suffix}`}
        className="text-xl font-bold tabular-nums text-gold"
      />
      <Text className={['text-center text-[10px] font-medium uppercase tracking-wider', tc.textMuted].join(' ')}>
        {label}
      </Text>
    </Animated.View>
  )
}
