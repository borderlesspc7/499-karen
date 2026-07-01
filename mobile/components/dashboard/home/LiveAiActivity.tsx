import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Bot, Calendar, Facebook, Globe, Instagram, Linkedin, Mail } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { ActivatedGlow } from '@/components/ui/ActivatedGlow'

type AiActivityItem = {
  id: string
  message: string
  timeAgo: string
  icon: LucideIcon
  accentColor: string
}

const AI_ACTIVITY_FEED: AiActivityItem[] = [
  {
    id: 'activity-1',
    message: 'IA respondeu a um comentário no Instagram',
    timeAgo: 'Há 2 min',
    icon: Instagram,
    accentColor: '#DB2777',
  },
  {
    id: 'activity-2',
    message: 'IA qualificou um lead no LinkedIn',
    timeAgo: 'Há 15 min',
    icon: Linkedin,
    accentColor: '#0A66C2',
  },
  {
    id: 'activity-3',
    message: 'IA agendou uma reunião via E-mail',
    timeAgo: 'Há 1 hora',
    icon: Mail,
    accentColor: '#3B82F6',
  },
]

const CAMPAIGN_LAUNCH_FEED: AiActivityItem[] = [
  {
    id: 'launch-1',
    message: 'IA publicou o carrossel de harmonização no Instagram',
    timeAgo: 'Agora',
    icon: Instagram,
    accentColor: '#DB2777',
  },
  {
    id: 'launch-2',
    message: 'IA disparou a sequência de e-mails de boas-vindas',
    timeAgo: 'Agora',
    icon: Mail,
    accentColor: '#3B82F6',
  },
  {
    id: 'launch-3',
    message: 'IA sincronizou a copy da landing page nos canais',
    timeAgo: 'Agora',
    icon: Globe,
    accentColor: '#10B981',
  },
  {
    id: 'launch-4',
    message: 'IA publicou o post de conversão no Facebook',
    timeAgo: 'Agora',
    icon: Facebook,
    accentColor: '#1877F2',
  },
]

const REVEAL_INTERVAL_MS = 1000

type LiveAiActivityProps = {
  isLiveReveal?: boolean
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

function ActivityFeedItem({ item, index }: { item: AiActivityItem; index: number }) {
  const Icon = item.icon

  return (
    <Animated.View
      entering={SlideInUp.delay(index * 80).duration(400).springify().damping(16)}
      className="flex-row items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3"
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${item.accentColor}18` }}
      >
        <Icon size={16} color={item.accentColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium leading-5 text-deepBlue">{item.message}</Text>
        <View className="mt-0.5 flex-row items-center gap-1">
          <Calendar size={10} color="#94A3B8" />
          <Text className="text-xs text-slate-400">({item.timeAgo})</Text>
        </View>
      </View>
    </Animated.View>
  )
}

export function LiveAiActivity({ isLiveReveal = false }: LiveAiActivityProps) {
  const feed = isLiveReveal ? CAMPAIGN_LAUNCH_FEED : AI_ACTIVITY_FEED
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

  return (
    <ActivatedGlow active={isLiveReveal}>
      <Animated.View
        entering={isLiveReveal ? FadeIn.duration(500) : undefined}
        className="rounded-3xl border border-white bg-white p-5 shadow-sm"
        style={{
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-deepBlue/5">
            <Bot size={18} color="#0F172A" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-deepBlue">Atividade da IA em Tempo Real</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <PulsingStatusDot />
              <Text className="text-xs font-semibold text-emerald">
                {isLiveReveal
                  ? 'AI Workforce assumiu o controle — publicando agora'
                  : 'AI Workforce — Respostas Automáticas ATIVAS'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="mt-4 max-h-52"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            {visibleItems.map((item, index) => (
              <ActivityFeedItem key={item.id} item={item} index={index} />
            ))}

            {isLiveReveal && visibleCount < feed.length ? (
              <View className="flex-row items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3">
                <View className="h-2 w-2 rounded-full bg-electricBlue/60" />
                <Text className="text-xs font-medium text-slate-400">
                  AI Workforce em ação...
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </Animated.View>
    </ActivatedGlow>
  )
}
