import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

type ConfettiBurstProps = {
  active: boolean
}

const PARTICLE_COLORS = ['#C5A059', '#10B981', '#3B82F6', '#F59E0B', '#EC4899']

function Particle({ index, active }: { index: number; active: boolean }) {
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(0)
  const angle = (index / 12) * Math.PI * 2
  const distance = 40 + (index % 4) * 20

  useEffect(() => {
    if (!active) {
      opacity.value = 0
      return
    }

    opacity.value = withDelay(index * 40, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) }),
    ))
    translateX.value = withDelay(
      index * 40,
      withTiming(Math.cos(angle) * distance, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    )
    translateY.value = withDelay(
      index * 40,
      withTiming(Math.sin(angle) * distance - 30, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    )
  }, [active, angle, distance, index, opacity, translateX, translateY])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
        },
        style,
      ]}
    />
  )
}

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  if (!active) return null

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 top-1/3 items-center justify-center"
      style={{ height: 1 }}
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <Particle key={index} index={index} active={active} />
      ))}
    </View>
  )
}
