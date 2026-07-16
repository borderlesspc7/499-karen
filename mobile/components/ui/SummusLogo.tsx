import { Image, View, type ImageStyle, type StyleProp } from 'react-native'
import { summusLogoIconImage, summusLogoImage } from '@/constants/summus-brand'

type SummusLogoProps = {
  compact?: boolean
  variant?: 'full' | 'icon'
  centered?: boolean
  style?: StyleProp<ImageStyle>
}

const sizeByVariant = {
  full: {
    compact: { width: 200, height: 248 },
    default: { width: 240, height: 296 },
  },
  icon: {
    compact: { width: 40, height: 40 },
    default: { width: 56, height: 56 },
  },
} as const

export function SummusLogo({
  compact = false,
  variant = 'full',
  centered = false,
  style,
}: SummusLogoProps) {
  const dimensions = sizeByVariant[variant][compact ? 'compact' : 'default']
  const source = variant === 'icon' ? summusLogoIconImage : summusLogoImage

  return (
    <View className={centered ? 'items-center justify-center' : 'items-start justify-center'}>
      <Image
        source={source}
        accessibilityLabel="Summus Edge — Cognitive Operating System"
        resizeMode="contain"
        style={[{ width: dimensions.width, height: dimensions.height }, style]}
      />
    </View>
  )
}
