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
  glowColor = '#3B82F6',
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
    shadowOpacity: active ? 0.12 + glowOpacity.value * 0.28 : 0,
    borderColor: active ? `rgba(59, 130, 246, ${0.25 + glowOpacity.value * 0.45})` : 'transparent',
  }))

  return (
    <Animated.View
      className={className}
      style={[
        {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 16,
          elevation: active ? 6 : 0,
          borderWidth: active ? 1.5 : 0,
          borderRadius: 24,
        },
        glowStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  )
}
