import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type AiWorkforceOrbProps = {
  compact?: boolean
}

export function AiWorkforceOrb({ compact = false }: AiWorkforceOrbProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()
  const pulse = useSharedValue(1)
  const glow = useSharedValue(0.35)
  const rotate = useSharedValue(0)

  const size = compact ? 120 : isWebDesktop ? 200 : 140

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    glow.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [glow, pulse, rotate])

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: pulse.value }],
  }))

  const innerOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + pulse.value * 0.06 }],
  }))

  const ringRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }))

  return (
    <View
      className={[
        'items-center justify-center',
        isWebDesktop && !compact ? 'flex-1 py-8' : 'py-4',
      ].join(' ')}
      style={{ minHeight: size + 40 }}
    >
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: `${premiumColors.gold}40`,
            },
            outerRingStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: size * 0.85,
              height: size * 0.85,
              borderRadius: (size * 0.85) / 2,
              borderWidth: 1,
              borderColor: `${premiumColors.gold}25`,
            },
            ringRotateStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: size * 0.55,
              height: size * 0.55,
              borderRadius: (size * 0.55) / 2,
              backgroundColor: tc.isDark ? 'rgba(197, 160, 89, 0.15)' : 'rgba(197, 160, 89, 0.12)',
              borderWidth: 1,
              borderColor: `${premiumColors.gold}50`,
              shadowColor: premiumColors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 24,
            },
            innerOrbStyle,
          ]}
        />
        <View
          style={{
            position: 'absolute',
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: (size * 0.25) / 2,
            backgroundColor: premiumColors.gold,
            opacity: 0.85,
          }}
        />
      </View>

      <Text
        className={[
          'mt-6 max-w-[240px] text-center text-sm font-medium leading-5',
          tc.textSecondary,
        ].join(' ')}
      >
        Cognitive Core — motores permanentes em toda interação
      </Text>
    </View>
  )
}
