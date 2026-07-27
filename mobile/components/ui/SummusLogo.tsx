import { Image, useWindowDimensions, View, type ImageStyle, type StyleProp } from 'react-native'
import { summusLogoIconImage, summusLogoImage } from '@/constants/summus-brand'

type SummusLogoProps = {
  compact?: boolean
  variant?: 'full' | 'icon'
  centered?: boolean
  style?: StyleProp<ImageStyle>
}

/**
 * Logo quadrada (1024×1024). Mantém aspect ratio 1:1 com contain e
 * limita a largura à área segura da tela para evitar crop no splash/login.
 */
export function SummusLogo({
  compact = false,
  variant = 'full',
  centered = false,
  style,
}: SummusLogoProps) {
  const { width: windowWidth } = useWindowDimensions()
  const source = variant === 'icon' ? summusLogoIconImage : summusLogoImage

  const maxFullWidth = Math.min(windowWidth * 0.55, compact ? 168 : 200)
  const dimensions =
    variant === 'icon'
      ? compact
        ? { width: 40, height: 40 }
        : { width: 56, height: 56 }
      : { width: maxFullWidth, height: maxFullWidth }

  return (
    <View
      className={centered ? 'items-center justify-center' : 'items-start justify-center'}
      style={variant === 'full' ? { paddingHorizontal: 16 } : undefined}
    >
      <Image
        source={source}
        accessibilityLabel="Summus Edge — Meridian"
        resizeMode="contain"
        style={[{ width: dimensions.width, height: dimensions.height }, style]}
      />
    </View>
  )
}
