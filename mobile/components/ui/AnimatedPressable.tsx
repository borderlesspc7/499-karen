import type { ReactNode } from 'react'
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { triggerLightHaptic } from '@/lib/haptics'

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable)

const SPRING_CONFIG = { damping: 18, stiffness: 420 }

type AnimatedPressableProps = PressableProps & {
  children: ReactNode
  className?: string
  haptic?: boolean
  pressScale?: number
  pressOpacity?: number
  style?: StyleProp<ViewStyle>
}

export function AnimatedPressable({
  children,
  className,
  haptic = true,
  pressScale = 0.97,
  pressOpacity = 0.88,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <AnimatedPressableBase
      {...rest}
      className={className}
      onPress={(event) => {
        if (haptic) {
          triggerLightHaptic()
        }
        onPress?.(event)
      }}
      onPressIn={(event) => {
        scale.value = withSpring(pressScale, SPRING_CONFIG)
        opacity.value = withSpring(pressOpacity, SPRING_CONFIG)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, SPRING_CONFIG)
        opacity.value = withSpring(1, SPRING_CONFIG)
        onPressOut?.(event)
      }}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressableBase>
  )
}
