import type { ReactNode } from 'react'
import { Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SummusModalCloseButton } from './SummusModalCloseButton'
import { SummusModalBadge } from './SummusModalBadge'
import type { LucideIcon } from 'lucide-react-native'
import { Text } from 'react-native'

type SummusSheetModalProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  badge?: string
  badgeIcon?: LucideIcon
  badgeTone?: 'gold' | 'blue' | 'emerald'
  title?: string
  subtitle?: string
  showClose?: boolean
  presentationStyle?: 'fullScreen' | 'pageSheet'
}

export function SummusSheetModal({
  visible,
  onClose,
  children,
  badge,
  badgeIcon,
  badgeTone = 'gold',
  title,
  subtitle,
  showClose = true,
  presentationStyle = 'pageSheet',
}: SummusSheetModalProps) {
  const hasHeader = Boolean(badge || title || showClose)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-deepBlue" edges={['top', 'bottom']}>
        <View className="absolute inset-0 overflow-hidden">
          <View className="absolute -right-28 top-0 h-72 w-72 rounded-full bg-electricBlue/10" />
          <View className="absolute -left-36 bottom-24 h-80 w-80 rounded-full bg-gold/6" />
          <View className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
        </View>

        {hasHeader ? (
          <View className="relative z-10 border-b border-white/10 px-5 pb-4 pt-2">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-2">
                {badge ? (
                  <SummusModalBadge label={badge} icon={badgeIcon} tone={badgeTone} />
                ) : null}
                {title ? (
                  <Text className="text-2xl font-bold leading-8 text-white">{title}</Text>
                ) : null}
                {subtitle ? (
                  <Text className="text-sm leading-5 text-white/55">{subtitle}</Text>
                ) : null}
              </View>
              {showClose ? <SummusModalCloseButton onPress={onClose} /> : null}
            </View>
          </View>
        ) : null}

        <View className="relative z-10 flex-1">{children}</View>
      </SafeAreaView>
    </Modal>
  )
}
