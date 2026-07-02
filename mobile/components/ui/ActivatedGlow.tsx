import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { premiumColors } from '@/constants/premium-theme'

type ActivatedGlowProps = {
  active: boolean
  children: ReactNode
  className?: string
  style?: StyleProp<ViewStyle>
  glowColor?: string
}

export function ActivatedGlow({
  active,
  children,
  className,
  style,
  glowColor = premiumColors.gold,
}: ActivatedGlowProps) {
  const glowOpacity = useSharedValue(active ? 0.55 : 0)

  useEffect(() => {
    if (!active) {
      glowOpacity.value = withTiming(0, { duration: 400 })
      return
    }

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
  }, [active, glowOpacity])

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: active ? 0.1 + glowOpacity.value * 0.25 : 0,
    borderColor: active
      ? `rgba(197, 160, 89, ${0.2 + glowOpacity.value * 0.4})`
      : 'transparent',
  }))

  return (
    <Animated.View
      className={className}
      style={[
        {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 18,
          elevation: active ? 6 : 0,
          borderWidth: active ? 1.5 : 0,
          borderRadius: 12,
        },
        glowStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  )
}
