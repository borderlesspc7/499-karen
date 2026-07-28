import { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Brain } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import { ActivatedGlow } from '@/components/ui/ActivatedGlow'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type StrategicActivityItem = {
  id: string
  timestamp: string
  message: string
}

const REVEAL_INTERVAL_MS = 900

type LiveAiActivityProps = {
  isLiveReveal?: boolean
  embedded?: boolean
}

function PulsingStatusDot() {
  const pulse = useSharedValue(1)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [pulse])

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.85 + pulse.value * 0.15 }],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.5,
    transform: [{ scale: 1 + (1 - pulse.value) * 0.6 }],
  }))

  return (
    <View className="h-3.5 w-3.5 items-center justify-center">
      <Animated.View
        className="absolute h-3.5 w-3.5 rounded-full bg-emerald/30"
        style={ringStyle}
      />
      <Animated.View className="h-2.5 w-2.5 rounded-full bg-emerald" style={dotStyle} />
    </View>
  )
}

function TimelineItem({
  item,
  index,
  isLast,
}: {
  item: StrategicActivityItem
  index: number
  isLast: boolean
}) {
  const tc = useThemeClasses()

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 100).duration(400)}
      className="flex-row gap-4"
    >
      <View className="items-center">
        <View className="h-2 w-2 rounded-full bg-gold/80" />
        {!isLast ? (
          <View className={['mt-1 w-px flex-1 min-h-[28px]', tc.connectorLine].join(' ')} />
        ) : null}
      </View>
      <View className="min-w-0 flex-1 pb-4">
        <Text className={['text-[11px] font-medium tabular-nums', tc.textMuted].join(' ')}>
          {item.timestamp}
        </Text>
        <Text className={['mt-0.5 text-sm font-medium leading-5', tc.textPrimary].join(' ')}>
          {item.message}
        </Text>
      </View>
    </Animated.View>
  )
}

export function LiveAiActivity({ isLiveReveal = false, embedded = false }: LiveAiActivityProps) {
  const { t } = useTranslation()
  const tc = useThemeClasses()

  const strategicAiFeed = useMemo<StrategicActivityItem[]>(
    () => [
      { id: 's1', timestamp: '09:41', message: t('home.feedContext1') },
      { id: 's2', timestamp: '09:42', message: t('home.feedContext2') },
      { id: 's3', timestamp: '09:42', message: t('home.feedDecision1') },
      { id: 's4', timestamp: '09:43', message: t('home.feedDecision2') },
      { id: 's5', timestamp: '09:43', message: t('home.feedBlind1') },
      { id: 's6', timestamp: '09:44', message: t('home.feedIntegration') },
    ],
    [t],
  )

  const campaignLaunchFeed = useMemo<StrategicActivityItem[]>(
    () => [
      { id: 'l1', timestamp: t('home.now'), message: t('home.feedCampaign1') },
      { id: 'l2', timestamp: t('home.now'), message: t('home.feedCampaign2') },
      { id: 'l3', timestamp: t('home.now'), message: t('home.feedCampaign3') },
      { id: 'l4', timestamp: t('home.now'), message: t('home.feedCampaign4') },
      { id: 'l5', timestamp: t('home.now'), message: t('home.feedCampaign5') },
    ],
    [t],
  )

  const feed = isLiveReveal ? campaignLaunchFeed : strategicAiFeed
  const [visibleCount, setVisibleCount] = useState(isLiveReveal ? 0 : feed.length)

  useEffect(() => {
    if (!isLiveReveal) {
      setVisibleCount(feed.length)
      return
    }

    setVisibleCount(1)

    const revealTimer = setInterval(() => {
      setVisibleCount((current) => {
        if (current >= feed.length) {
          clearInterval(revealTimer)
          return current
        }
        return current + 1
      })
    }, REVEAL_INTERVAL_MS)

    return () => clearInterval(revealTimer)
  }, [feed.length, isLiveReveal])

  const visibleItems = feed.slice(0, visibleCount)
  const statusLabel = isLiveReveal ? t('home.livePipeline') : t('home.liveEnginesActive')

  const content = (
    <>
      {!embedded ? (
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl border border-gold/15 bg-gold/10">
            <Brain size={18} color={premiumColors.gold} strokeWidth={1.5} />
          </View>
          <View className="flex-1">
            <Text className={['text-base font-bold', tc.textPrimary].join(' ')}>
              {t('nav.meridian')}
            </Text>
            <View className="mt-1 flex-row items-center gap-2">
              <PulsingStatusDot />
              <Text className="text-xs font-semibold text-emerald">{statusLabel}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mb-3 flex-row items-center gap-2 px-2">
          <PulsingStatusDot />
          <Text className="text-xs font-semibold text-emerald">{statusLabel}</Text>
        </View>
      )}

      <ScrollView
        className={embedded ? 'max-h-64' : 'mt-5 max-h-56'}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View>
          {visibleItems.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isLast={index === visibleItems.length - 1}
            />
          ))}

          {isLiveReveal && visibleCount < feed.length ? (
            <View className="flex-row items-center gap-2 pl-6">
              <View className="h-1.5 w-1.5 rounded-full bg-gold/60" />
              <Text className={['text-xs font-medium', tc.textMuted].join(' ')}>
                {t('common.processing')}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  )

  if (embedded) {
    return <View className="p-4">{content}</View>
  }

  return (
    <ActivatedGlow active={isLiveReveal}>
      <Animated.View
        entering={isLiveReveal ? FadeIn.duration(500) : undefined}
        className={['p-6', tc.glassCard].join(' ')}
        style={tc.cardShadow}
      >
        {content}
      </Animated.View>
    </ActivatedGlow>
  )
}
