import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Brain } from 'lucide-react-native'
import { triggerSuccessHaptic } from '@/lib/haptics'

const LOADING_MESSAGES = [
  'Analisando o histórico da sua marca...',
  'Ajustando o tom de voz emocional...',
  "O 'Content Director' está criando as copys...",
  "O 'Design AI' está gerando os criativos...",
  'Sincronizando com seus canais...',
] as const

const MESSAGE_INTERVAL_MS = 1500
const FADE_DURATION_MS = 350

type CampaignMagicLoadingOverlayProps = {
  onComplete: () => void
}

function PulsingBrainIcon() {
  const pulse = useSharedValue(1)
  const glow = useSharedValue(0.4)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    glow.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
  }, [glow, pulse])

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: pulse.value }],
  }))

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + pulse.value * 0.08 }],
  }))

  return (
    <View className="h-32 w-32 items-center justify-center">
      <Animated.View
        style={ringStyle}
        className="absolute h-32 w-32 rounded-full border-2 border-electricBlue/50 bg-electricBlue/10"
      />
      <Animated.View
        style={ringStyle}
        className="absolute h-24 w-24 rounded-full bg-electricBlue/20"
      />
      <Animated.View style={iconStyle} className="items-center justify-center">
        <Brain size={48} color="#3B82F6" strokeWidth={1.75} />
      </Animated.View>
    </View>
  )
}

function FadingStatusText({ text }: { text: string }) {
  const opacity = useSharedValue(0)
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    if (text === displayText) {
      opacity.value = withTiming(1, {
        duration: FADE_DURATION_MS,
        easing: Easing.out(Easing.ease),
      })
      return
    }

    opacity.value = withTiming(0, { duration: FADE_DURATION_MS }, (finished) => {
      if (!finished) {
        return
      }

      runOnJS(setDisplayText)(text)
      opacity.value = withTiming(1, {
        duration: FADE_DURATION_MS,
        easing: Easing.out(Easing.ease),
      })
    })
  }, [displayText, opacity, text])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.Text
      style={animatedStyle}
      className="max-w-xs text-center text-lg font-medium leading-7 text-white/90"
    >
      {displayText}
    </Animated.Text>
  )
}

export function CampaignMagicLoadingOverlay({ onComplete }: CampaignMagicLoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    setMessageIndex(0)

    const messageInterval = setInterval(() => {
      setMessageIndex((current) => {
        if (current >= LOADING_MESSAGES.length - 1) {
          return current
        }
        return current + 1
      })
    }, MESSAGE_INTERVAL_MS)

    const completeTimer = setTimeout(() => {
      triggerSuccessHaptic()
      onComplete()
    }, MESSAGE_INTERVAL_MS * LOADING_MESSAGES.length)

    return () => {
      clearInterval(messageInterval)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.overlay}
      className="absolute inset-0 z-50 items-center justify-center px-8"
    >
      <PulsingBrainIcon />

      <View className="mt-10 min-h-[56px] items-center justify-center">
        <FadingStatusText text={LOADING_MESSAGES[messageIndex]} />
      </View>

      <View className="mt-8 flex-row gap-2">
        {LOADING_MESSAGES.map((message, index) => (
          <View
            key={message}
            className={[
              'h-1.5 rounded-full',
              index <= messageIndex ? 'w-6 bg-electricBlue' : 'w-3 bg-white/20',
            ].join(' ')}
          />
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
  },
})
