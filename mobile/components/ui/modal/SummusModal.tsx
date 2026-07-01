import type { ReactNode } from 'react'
import { Modal, Pressable } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

const BACKDROP_COLOR = 'rgba(15, 23, 42, 0.9)'

type SummusModalProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  dismissOnBackdrop?: boolean
}

export function SummusModal({
  visible,
  onClose,
  children,
  dismissOnBackdrop = true,
}: SummusModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: BACKDROP_COLOR }}
        onPress={dismissOnBackdrop ? onClose : undefined}
      >
        <Animated.View entering={FadeInDown.duration(380).springify().damping(18)}>
          <Pressable onPress={(event) => event.stopPropagation()}>{children}</Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

type SummusModalBackdropProps = {
  children: ReactNode
  onClose?: () => void
}

export function SummusModalBackdrop({ children, onClose }: SummusModalBackdropProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: BACKDROP_COLOR }}
    >
      <Pressable
        className="absolute inset-0"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar modal"
      />
      <Animated.View entering={FadeInDown.duration(380).springify().damping(18)}>
        {children}
      </Animated.View>
    </Animated.View>
  )
}
